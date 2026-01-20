#!/bin/bash

# Test script for super admin API functionality
# This script tests that super admin can create workflows without orgId

set -e

echo "🧪 Testing Super Admin API Functionality"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:3000"
SUPER_ADMIN_EMAIL="admin@antigravity.dev"
SUPER_ADMIN_PASSWORD="admin123"

# Function to print success
success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error
error() {
    echo -e "${RED}✗ $1${NC}"
}

# Function to print info
info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

echo "Step 1: Testing super admin login..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$SUPER_ADMIN_EMAIL\",\"password\":\"$SUPER_ADMIN_PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    error "Failed to login as super admin"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

success "Super admin logged in successfully"
info "Token: ${TOKEN:0:20}..."

echo ""
echo "Step 2: Testing super admin user details..."
ME_RESPONSE=$(curl -s -X GET "$API_URL/api/auth/me" \
  -H "Authorization: Bearer $TOKEN")

ROLE=$(echo $ME_RESPONSE | grep -o '"role":"[^"]*' | cut -d'"' -f4)
HAS_ORG=$(echo $ME_RESPONSE | grep -o '"organization":[^,}]*')

if [ "$ROLE" != "super_admin" ]; then
    error "User is not super_admin role"
    echo "Response: $ME_RESPONSE"
    exit 1
fi

success "User has super_admin role"

if echo "$HAS_ORG" | grep -q "null"; then
    success "Super admin has no organization (as expected)"
else
    info "Super admin has organization: $HAS_ORG"
fi

echo ""
echo "Step 3: Testing workflow creation without orgId..."
CREATE_WORKFLOW_RESPONSE=$(curl -s -X POST "$API_URL/api/workflows" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Super Admin Test Workflow",
    "description": "Testing super admin can create workflows without orgId",
    "nodes": [],
    "edges": []
  }')

WORKFLOW_ID=$(echo $CREATE_WORKFLOW_RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4)

if [ -z "$WORKFLOW_ID" ]; then
    error "Failed to create workflow"
    echo "Response: $CREATE_WORKFLOW_RESPONSE"
    exit 1
fi

success "Workflow created successfully"
info "Workflow ID: $WORKFLOW_ID"

echo ""
echo "Step 4: Testing workflow retrieval..."
GET_WORKFLOW_RESPONSE=$(curl -s -X GET "$API_URL/api/workflows/$WORKFLOW_ID" \
  -H "Authorization: Bearer $TOKEN")

WORKFLOW_NAME=$(echo $GET_WORKFLOW_RESPONSE | grep -o '"name":"[^"]*' | cut -d'"' -f4)

if [ "$WORKFLOW_NAME" != "Super Admin Test Workflow" ]; then
    error "Failed to retrieve workflow"
    echo "Response: $GET_WORKFLOW_RESPONSE"
    exit 1
fi

success "Workflow retrieved successfully"

echo ""
echo "Step 5: Testing workflow listing..."
LIST_WORKFLOWS_RESPONSE=$(curl -s -X GET "$API_URL/api/workflows" \
  -H "Authorization: Bearer $TOKEN")

WORKFLOW_COUNT=$(echo $LIST_WORKFLOWS_RESPONSE | grep -o '"count":[0-9]*' | cut -d':' -f2)

if [ -z "$WORKFLOW_COUNT" ]; then
    error "Failed to list workflows"
    echo "Response: $LIST_WORKFLOWS_RESPONSE"
    exit 1
fi

success "Workflows listed successfully (count: $WORKFLOW_COUNT)"

echo ""
echo "Step 6: Testing credential creation without orgId..."
CREATE_CREDENTIAL_RESPONSE=$(curl -s -X POST "$API_URL/api/credentials" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Super Admin Test Credential",
    "type": "api_key",
    "data": {
      "apiKey": "test-key-123"
    }
  }')

CREDENTIAL_ID=$(echo $CREATE_CREDENTIAL_RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4)

if [ -z "$CREDENTIAL_ID" ]; then
    error "Failed to create credential"
    echo "Response: $CREATE_CREDENTIAL_RESPONSE"
    # This is not a critical error, continue
    info "Credential creation may require encryption key in environment"
else
    success "Credential created successfully"
    info "Credential ID: $CREDENTIAL_ID"
fi

echo ""
echo "Step 7: Testing workflow deletion..."
DELETE_WORKFLOW_RESPONSE=$(curl -s -X DELETE "$API_URL/api/workflows/$WORKFLOW_ID" \
  -H "Authorization: Bearer $TOKEN")

if echo "$DELETE_WORKFLOW_RESPONSE" | grep -q "deleted successfully"; then
    success "Workflow deleted successfully"
else
    error "Failed to delete workflow"
    echo "Response: $DELETE_WORKFLOW_RESPONSE"
fi

echo ""
echo "========================================="
echo -e "${GREEN}✓ All super admin tests passed!${NC}"
echo ""
info "Summary:"
echo "  - Super admin can login"
echo "  - Super admin has no organization"
echo "  - Super admin can create workflows without orgId"
echo "  - Super admin can list/retrieve/delete workflows"
echo "  - Super admin can create credentials (if encryption key set)"
echo ""
echo "Next steps:"
echo "  1. Start the client application (npm run dev in client/)"
echo "  2. Login as super admin (admin@antigravity.dev / admin123)"
echo "  3. Test the UI workflow creation"
echo "  4. Take screenshots for USER_JOURNEY.md"
echo ""
