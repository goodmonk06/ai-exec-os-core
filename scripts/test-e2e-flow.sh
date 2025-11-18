#!/bin/bash

# End-to-End Flow Test Script
# This script demonstrates the complete vertical slice of the AI Exec OS Core

set -e

API_URL="${API_URL:-http://localhost:3000}"
echo "🚀 Testing AI Exec OS Core E2E Flow"
echo "API URL: $API_URL"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Health Check
echo -e "${BLUE}1. Health Check${NC}"
curl -s "$API_URL/health" | jq .
echo ""

# 2. List Agents
echo -e "${BLUE}2. Listing Agents${NC}"
AGENTS=$(curl -s "$API_URL/agents")
echo "$AGENTS" | jq .
AGENT_ID=$(echo "$AGENTS" | jq -r '.[0].id')
echo -e "${GREEN}✓ Found Agent ID: $AGENT_ID${NC}"
echo ""

# 3. List Workflows
echo -e "${BLUE}3. Listing Workflows${NC}"
WORKFLOWS=$(curl -s "$API_URL/workflows")
echo "$WORKFLOWS" | jq .
WORKFLOW_ID=$(echo "$WORKFLOWS" | jq -r '.[] | select(.name == "Simple Echo Workflow") | .id')
echo -e "${GREEN}✓ Found Simple Echo Workflow ID: $WORKFLOW_ID${NC}"
echo ""

# 4. Trigger Workflow
echo -e "${BLUE}4. Triggering Workflow${NC}"
JOB=$(curl -s -X POST "$API_URL/workflows/$WORKFLOW_ID/trigger" \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "message": "Hello from E2E test!",
      "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
    }
  }')
echo "$JOB" | jq .
JOB_ID=$(echo "$JOB" | jq -r '.id')
echo -e "${GREEN}✓ Created Job ID: $JOB_ID${NC}"
echo ""

# 5. Wait for job to complete
echo -e "${BLUE}5. Waiting for Job to Complete${NC}"
for i in {1..10}; do
  sleep 2
  JOB_STATUS=$(curl -s "$API_URL/jobs/$JOB_ID" | jq -r '.status')
  echo "   Status: $JOB_STATUS (attempt $i/10)"

  if [ "$JOB_STATUS" = "succeeded" ] || [ "$JOB_STATUS" = "failed" ]; then
    break
  fi
done
echo ""

# 6. Get Job Details with Logs
echo -e "${BLUE}6. Job Details and Logs${NC}"
JOB_DETAILS=$(curl -s "$API_URL/jobs/$JOB_ID")
echo "$JOB_DETAILS" | jq .
echo ""

# 7. Summary
echo -e "${BLUE}7. Summary${NC}"
STATUS=$(echo "$JOB_DETAILS" | jq -r '.status')
if [ "$STATUS" = "succeeded" ]; then
  echo -e "${GREEN}✓ E2E Flow Test: SUCCESS${NC}"
  echo "  - Agent created and listed"
  echo "  - Workflow created and listed"
  echo "  - Job triggered and completed"
  echo "  - Logs captured"
else
  echo "⚠ E2E Flow Test: Job Status = $STATUS"
fi
echo ""
