#!/bin/bash
cd /home/kavia/workspace/code-generation/cyber-threat-monitoring-dashboard-245/advanced_cybersecurity_ai_dashboard_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

