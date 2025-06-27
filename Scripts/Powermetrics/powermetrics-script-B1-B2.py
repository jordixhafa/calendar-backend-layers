import subprocess
import time
import re
import statistics
import os
from pathlib import Path

# === Configuration ===
RUN_ID = 18000
NUM_RUNS = 6
SLEEP_BETWEEN_RUNS = 3  # seconds
INTERVAL_MS = 100

OUTPUT_DIR_BASE = Path("/Users/jordixhafa/Desktop/calendar-backend/metrics")
OUTPUT_DIR = OUTPUT_DIR_BASE / f"metrics_{RUN_ID}"
RESULT_DIR = Path("/Users/jordixhafa/Desktop/calendar-backend/results")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
RESULT_DIR.mkdir(parents=True, exist_ok=True)

RESULT_FILE = RESULT_DIR / f"result_{RUN_ID}.txt"

def run_powermetrics_and_test(run_index):
    output_path = OUTPUT_DIR / f"powerlog_{RUN_ID}_{run_index}.txt"

    # Start powermetrics
    with open(output_path, "w") as logfile:
        proc = subprocess.Popen(
            ["sudo", "/usr/bin/powermetrics", "-i", str(INTERVAL_MS)],
            stdout=logfile,
            stderr=subprocess.DEVNULL
        )
        print(f"[RUN {run_index + 1}] powermetrics started...")

        start_time = time.time()

        try:
            subprocess.run(["npm", "test"], check=True)
        except subprocess.CalledProcessError:
            print("[ERROR] npm test failed")

        end_time = time.time()
        elapsed_time = end_time - start_time

        # Stop powermetrics
        print(f"[RUN {run_index + 1}] Stopping powermetrics (PID {proc.pid})...")
        subprocess.run(["sudo", "pkill", "-f", "powermetrics"])
        proc.wait()

    return output_path, elapsed_time

def parse_log_file(filepath):
    try:
        with open(filepath, "r") as f:
            content = f.read()
    except FileNotFoundError:
        return None

    energy_data = {
        "node": [],
        "postgres": []
    }

    blocks = re.split(r"\*\*\* Sampled system activity .+?\*\*\*", content, flags=re.DOTALL)
    for block in blocks:
        for match in re.finditer(r"^\s*(node|postgres)\s+\d+\s+[\d.]+\s+[\d.]+\s+.*?([\d.]+)\s*$", block, flags=re.MULTILINE):
            process = match.group(1)
            energy = float(match.group(2))
            energy_data[process].append(energy)

    return {
        "node_energy": sum(energy_data["node"]),
        "postgres_energy": sum(energy_data["postgres"]),
        "total_energy": sum(energy_data["node"]) + sum(energy_data["postgres"])
    }

def main():
    node_energies = []
    postgres_energies = []
    total_energies = []
    times = []

    for i in range(NUM_RUNS):
        print(f"\n--- RUN {i + 1}/{NUM_RUNS} ---")
        log_path, elapsed_time = run_powermetrics_and_test(i)
        print(f"Finished run {i + 1}, sleeping {SLEEP_BETWEEN_RUNS}s...")
        time.sleep(SLEEP_BETWEEN_RUNS)

        result = parse_log_file(log_path)
        if result:
            node_energy = result["node_energy"]
            postgres_energy = result["postgres_energy"]
            total_energy = result["total_energy"]

            node_energies.append(node_energy)
            postgres_energies.append(postgres_energy)
            total_energies.append(total_energy)
            times.append(elapsed_time)

            with open(RESULT_FILE, "a") as f:
                f.write(f"--- Run {i + 1} ---\n")
                f.write(f"Node Energy: {node_energy:.2f}\n")
                f.write(f"Postgres Energy: {postgres_energy:.2f}\n")
                f.write(f"Total Energy Impact: {total_energy:.2f}\n")
                f.write(f"Execution Time (s): {elapsed_time:.2f}\n\n")
        else:
            with open(RESULT_FILE, "a") as f:
                f.write(f"--- Run {i + 1} ---\nNo data found.\n\n")

    if total_energies:
        avg_node = statistics.mean(node_energies)
        avg_postgres = statistics.mean(postgres_energies)
        avg_total = statistics.mean(total_energies)
        avg_time = statistics.mean(times)

        with open(RESULT_FILE, "a") as f:
            f.write("=== FINAL AVERAGE TOTALS ===\n")
            f.write(f"Average Node Energy: {avg_node:.2f}\n")
            f.write(f"Average Postgres Energy: {avg_postgres:.2f}\n")
            f.write(f"Average Total Energy: {avg_total:.2f}\n")
            f.write(f"Average Execution Time (s): {avg_time:.2f}\n")

if __name__ == "__main__":
    main()
