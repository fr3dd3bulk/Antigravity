# Antigravity - Complete Testing Guide

## Overview

This guide provides step-by-step instructions for testing the Antigravity platform locally.

## Prerequisites

- Node.js 20 LTS
- Docker and Docker Compose
- MongoDB and Redis (via Docker)

## Setup Instructions

### 1. Start Infrastructure Services

```bash
# Start MongoDB and Redis
docker-compose up -d

# Verify services are running
docker ps
```

### 2. Setup Server

```bash
cd server

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# The .env file should contain:
# NODE_ENV=development
# PORT=3000
# MONGODB_URI=mongodb://admin:password123@localhost:27017/antigravity?authSource=admin
# REDIS_HOST=localhost
# REDIS_PORT=6379
# JWT_SECRET=your-secret-key-change-this
# JWT_EXPIRES_IN=7d
# CLIENT_URL=http://localhost:5173

# Start the server
npm run dev
```

The server will:
- Connect to MongoDB
- Connect to Redis
- Seed 100+ ActionDefinitions automatically
- Start BullMQ worker
- Listen on http://localhost:3000

### 3. Setup Client

```bash
cd client

# Install dependencies
npm install

# Create .env file (optional, defaults work)
cp .env.example .env

# Start the development server
npm run dev
```

The client will start on http://localhost:5173

## Testing Workflow

### 1. User Registration & Authentication

1. Open http://localhost:5173 in your browser
2. You'll be redirected to the login page
3. Click "Sign up" to create an account
4. Fill in the registration form:
   - Full Name: `John Doe`
   - Email: `john@example.com`
   - Organization Name: `ACME Inc`
   - Password: `password123`
   - Confirm Password: `password123`
5. Click "Create Account"
6. You should be redirected to the Dashboard

### 2. Explore the Dashboard

1. You should see "My Workflows" with 0 workflows initially
2. Click "Create Workflow" button
3. Enter workflow details:
   - Workflow Name: `Test Workflow`
   - Description: `My first automation`
4. Click "Create Workflow"
5. You'll be redirected to the Workflow Editor

### 3. Build a Workflow

1. **Sidebar**: You'll see 100+ actions on the left sidebar
2. **Categories**: Filter by category (Social, Google, Marketing, Utilities, Communication)
3. **Search**: Use the search box to find specific actions

#### Create a Simple Workflow:

1. Search for "HTTP Request" in the sidebar
2. Drag it onto the canvas
3. Click the settings icon on the node
4. Configure the HTTP Request:
   - Method: `POST`
   - URL: `https://httpbin.org/post`
   - Body: `{"test": "data"}`
5. Click "Save Configuration"

6. Add another node:
   - Search for "Slack - Send Message"
   - Drag it below the HTTP Request node
   - Connect the HTTP Request node to the Slack node (drag from bottom handle to top handle)
   - Configure:
     - Channel: `#general`
     - Message: `Workflow executed successfully!`
   - Save Configuration

7. Click "Save" in the toolbar to save the workflow
8. Click "Execute" to run the workflow

### 4. View Execution Results

1. Check the browser console or server logs for execution results
2. The execution will be processed by BullMQ in the background
3. Check the server console for detailed logs

### 5. Test Super Admin Features

To test the Super Admin dashboard:

1. **Create a Super Admin User**: 
   - You'll need to manually update a user in MongoDB to have role `super_admin`
   
   ```bash
   # Connect to MongoDB
   docker exec -it antigravity_mongodb mongosh -u admin -p password123 --authenticationDatabase admin
   
   # Switch to antigravity database
   use antigravity
   
   # Update user to super_admin
   db.users.updateOne({email: "john@example.com"}, {$set: {role: "super_admin"}})
   
   # Exit
   exit
   ```

2. Refresh the browser and navigate to `/admin/actions`
3. You'll see all 100+ ActionDefinitions
4. You can filter by category
5. Delete actions (they won't come back unless you restart the server to re-seed)

### 6. Test Webhook Triggers

1. Create a workflow with trigger type `webhook`
2. The workflow will be assigned a webhookId (e.g., `wh_abc123xyz`)
3. Trigger it via HTTP:

```bash
curl -X POST http://localhost:3000/hooks/wh_abc123xyz \
  -H "Content-Type: application/json" \
  -d '{"test": "webhook data"}'
```

### 7. API Documentation

Visit http://localhost:3000/api-docs to see the Swagger API documentation

### 8. Test Multiple Workflows

1. Go back to Dashboard (`/dashboard`)
2. Create multiple workflows
3. Each workflow appears as a card
4. Test:
   - Creating workflows
   - Editing workflows
   - Executing workflows
   - Deleting workflows

## API Testing with curl

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "password123",
    "orgName": "Tech Corp"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@example.com",
    "password": "password123"
  }'
```

Save the token from the response.

### List Actions
```bash
curl http://localhost:3000/api/actions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create Workflow
```bash
curl -X POST http://localhost:3000/api/workflows \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "API Test Workflow",
    "description": "Created via API",
    "nodes": [],
    "edges": []
  }'
```

## Running Tests

### Server Tests
```bash
cd server
npm test
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure Docker containers are running: `docker ps`
- Check MongoDB logs: `docker logs antigravity_mongodb`
- Verify connection string in `.env`

### Redis Connection Issues
- Check Redis logs: `docker logs antigravity_redis`
- Verify Redis is accepting connections: `redis-cli ping`

### Frontend Not Loading Actions
- Check browser console for errors
- Verify server is running on port 3000
- Check CORS settings in server
- Ensure you're logged in (token in localStorage)

### Workflow Execution Fails
- Check server console for detailed error logs
- Verify BullMQ worker is running
- Check Redis connection
- Ensure ActionDefinitions are seeded

## Key Features to Test

1. ✅ User Registration & Login
2. ✅ JWT Authentication
3. ✅ Organization Creation
4. ✅ 100+ Pre-seeded Action Definitions
5. ✅ Dynamic Action Sidebar
6. ✅ React Flow Canvas
7. ✅ Drag & Drop Nodes
8. ✅ Node Configuration with DynamicNodeForm
9. ✅ Workflow Save/Load
10. ✅ Workflow Execution via BullMQ
11. ✅ Variable Substitution ({{input.field}})
12. ✅ Webhook Triggers
13. ✅ Super Admin Dashboard
14. ✅ Theme Color #571B0A throughout UI

## Architecture Highlights

### Meta-Driven Design
- **No Hardcoded Integrations**: All 100+ actions are defined as JSON in the database
- **Super Admin Control**: Create new integrations without code
- **Dynamic Forms**: UI automatically renders based on ActionDefinition.inputSchema
- **Generic Execution Engine**: runner.js executes any action based on its definition

### Key Components
- **DynamicNodeForm.jsx**: Renders form inputs from JSON schema
- **runner.js**: Variable substitution and HTTP execution
- **worker.js**: BullMQ job processor
- **seeder/actions.js**: Generates 100+ ActionDefinitions programmatically

## Production Deployment Notes

For production deployment, consider:

1. Use environment variables for all secrets
2. Enable MongoDB authentication and SSL
3. Use Redis password authentication
4. Set up proper CORS origins
5. Enable rate limiting
6. Add request validation
7. Set up monitoring (e.g., Sentry, DataDog)
8. Use a proper secret manager for credentials
9. Sandbox code execution (replace `eval` in runner.js)
10. Add comprehensive error handling
11. Set up CI/CD pipelines
12. Configure auto-scaling for workers
13. Add database backups
14. Set up SSL/TLS certificates
15. Use a CDN for frontend assets
