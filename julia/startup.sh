#!/bin/bash

# Start Jupyter
/usr/local/bin/start-notebook.sh &

# Start Flask
cd /home/jovyan/
flask --app web run --host=0.0.0.0 &

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $?
