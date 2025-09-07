import time, sys

print("Python says: starting work...", flush=True)
for i in range(5):
    print(f"step {i+1}/5", flush=True)
    time.sleep(0.5)
print("Python finished.", flush=True)
