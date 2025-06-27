import subprocess
import time
import statistics
import os
import re
from pathlib import Path

# === Configuration ===
RUN_ID = 3000
NUM_RUNS = 2
SLEEP_BETWEEN_RUNS = 7  # make sure each run has time to finish

OUTPUT_DIR_BASE = Path("/Users/jordixhafa/Desktop/calendar-backend/metrics")
OUTPUT_DIR = OUTPUT_DIR_BASE / f"metrics_{RUN_ID}"
RESULT_DIR = Path("/Users/jordixhafa/Desktop/calendar-backend/results/Intel Power Gadget")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
RESULT_DIR.mkdir(parents=True, exist_ok=True)

RESULT_FILE = RESULT_DIR / f"result_{RUN_ID}.txt"

POWERLOG_PATH = "/Applications/Intel Power Gadget/PowerLog"

FIELDS_TO_EXTRACT = {
    "Total Elapsed Time (sec)": [],
    "Cumulative Package Energy_0 (Joules)": [],
    "Average Package Power_0 (Watt)": [],
    "Cumulative DRAM Energy_0 (Joules)": [],
    "Average Package DRAM_0 (Watt)": []
}


def run_powerlog_and_test(run_index):
    output_csv = OUTPUT_DIR / f"powerlog_{RUN_ID}_{run_index}.csv"

    proc = subprocess.Popen([
        "sudo", POWERLOG_PATH,
        "-duration", "12",  # Long enough to outlast the test
        "-file", str(output_csv)
    ])
    print(f"[RUN {run_index + 1}] PowerLog started (PID {proc.pid})...")

    try:
        subprocess.run(["npm", "test"], check=True)
    except subprocess.CalledProcessError:
        print("[ERROR] npm test failed")

    # Kill PowerLog after test is done
    print(f"[RUN {run_index + 1}] Stopping PowerLog...")
    subprocess.run(["sudo", "pkill", "-f", "PowerLog"])
    proc.wait()
    return output_csv


def parse_summary_fields(csv_path):
    try:
        with open(csv_path, "r") as f:
            lines = f.readlines()

        # Search for summary fields at the bottom of the file
        values = {}
        for key in FIELDS_TO_EXTRACT:
            for line in reversed(lines):
                if line.startswith(key):
                    match = re.search(r"= ([0-9.]+)", line)
                    if match:
                        values[key] = float(match.group(1))
                    break

        # If all expected keys are found, store them
        for k, v in values.items():
            FIELDS_TO_EXTRACT[k].append(v)

    except Exception as e:
        print(f"[ERROR] Could not parse {csv_path}: {e}")


def main():
    for i in range(NUM_RUNS):
        print(f"\n--- RUN {i + 1}/{NUM_RUNS} ---")
        csv_path = run_powerlog_and_test(i)
        print(f"[RUN {i + 1}] Waiting for PowerLog to flush output...")
        time.sleep(SLEEP_BETWEEN_RUNS)

        parse_summary_fields(csv_path)

    # Write results
    with open(RESULT_FILE, "w") as f:
        f.write(f"=== AVERAGED METRICS OVER {NUM_RUNS} RUNS ===\n\n")
        for field, values in FIELDS_TO_EXTRACT.items():
            if values:
                avg = statistics.mean(values)
                f.write(f"{field}: {avg:.6f}\n")
            else:
                f.write(f"{field}: No data\n")


if __name__ == "__main__":
    main()
