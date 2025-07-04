import subprocess
import time
import statistics
import csv
import re
from pathlib import Path

# === Configuration ===
RUN_ID = 20000
NUM_RUNS = 4
SLEEP_BETWEEN_RUNS = 2  # seconds
DURATION = 4  # PowerLog run time in seconds

TEST_FILE = "layer3.test.ts"  # <<< CHANGE THIS FOR EACH LAYER TEST

POWERLOG_PATH = "/Applications/Intel Power Gadget/PowerLog"
OUTPUT_DIR = Path(f"/Users/jordixhafa/Desktop/calendar-backend/metrics/metrics_{RUN_ID}")
RESULT_DIR = Path("/Users/jordixhafa/Desktop/calendar-backend/results/Layers")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
RESULT_DIR.mkdir(parents=True, exist_ok=True)
RESULT_FILE = RESULT_DIR / f"result_{RUN_ID}.txt"

FIELDS = {
    "Total Elapsed Time (sec)": "elapsed_time",
    "Cumulative Package Energy_0 (Joules)": "package_energy",
    "Average Package Power_0 (Watt)": "package_power",
    "Cumulative DRAM Energy_0 (Joules)": "dram_energy",
    "Average Package DRAM_0 (Watt)": "dram_power",
}

def run_powerlog_and_test(run_index):
    output_csv = OUTPUT_DIR / f"powerlog_{RUN_ID}_{run_index}.csv"
    proc = subprocess.Popen([
        POWERLOG_PATH, "-duration", str(DURATION), "-file", str(output_csv)
    ])
    print(f"[RUN {run_index + 1}] PowerLog started...")

    start_time = time.time()
    try:
        subprocess.run(["npm", "test", "--", TEST_FILE], check=True)
    except subprocess.CalledProcessError:
        print("[ERROR] npm test failed")
    end_time = time.time()

    proc.wait()
    print(f"[RUN {run_index + 1}] PowerLog finished.")
    return output_csv, end_time - start_time

def parse_powerlog_csv(filepath):
    summary_values = {}
    try:
        with open(filepath, "r") as f:
            lines = f.readlines()
        for line in lines:
            for key in FIELDS:
                if key in line:
                    match = re.search(r"= ([0-9.]+)", line)
                    if match:
                        summary_values[FIELDS[key]] = float(match.group(1))
        if len(summary_values) != len(FIELDS):
            raise ValueError("Incomplete data in summary row.")
        return summary_values
    except Exception as e:
        print(f"[ERROR] Failed to parse {filepath}: {e}")
        return None

def main():
    metrics = {key: [] for key in FIELDS.values()}
    test_times = []

    for i in range(NUM_RUNS):
        print(f"\n--- RUN {i + 1}/{NUM_RUNS} ---")
        csv_path, test_time = run_powerlog_and_test(i)
        time.sleep(SLEEP_BETWEEN_RUNS)

        result = parse_powerlog_csv(csv_path)
        if result:
            for key, value in result.items():
                metrics[key].append(value)
            test_times.append(test_time)

            with open(RESULT_FILE, "a") as f:
                f.write(f"--- Run {i + 1} ---\n")
                for field, var in FIELDS.items():
                    f.write(f"{field}: {result[var]:.3f}\n")
                f.write(f"Actual Test Execution Time (s): {test_time:.3f}\n\n")
        else:
            with open(RESULT_FILE, "a") as f:
                f.write(f"--- Run {i + 1} ---\nNo data found.\n\n")

    with open(RESULT_FILE, "a") as f:
        f.write("=== FINAL AVERAGE TOTALS ===\n")
        for field, var in FIELDS.items():
            if metrics[var]:
                f.write(f"{field}: {statistics.mean(metrics[var]):.3f}\n")
        if test_times:
            f.write(f"Average Actual Test Execution Time (s): {statistics.mean(test_times):.3f}\n")

if __name__ == "__main__":
    main()
