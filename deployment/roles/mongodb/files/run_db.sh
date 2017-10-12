#!/usr/bin/env bash

# Solvers
PROCESSES=$(ps -ef | grep mongod | grep -v grep | wc -l)
echo $PROCESSES
MAX_PROCESSES=1
if ((PROCESSES < MAX_PROCESSES)); then
       sudo nohup mongod --config /etc/mongod.conf &
fi
