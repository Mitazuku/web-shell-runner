#!/usr/bin/env bash
set -euo pipefail

echo "Hello from hello.sh"
echo "date: $(date)"
sleep 1
echo "listing python directory:"
ls -la ../python
sleep 1
echo "done."
