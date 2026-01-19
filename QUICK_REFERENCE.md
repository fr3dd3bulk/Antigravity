# 🚀 Antigravity - Quick Reference Card

## Start Development

```bash
# Quick Start (Automated)
./start.sh

# Manual Start
docker-compose up -d          # Start MongoDB + Redis
cd server && npm install && npm run dev    # Start backend
cd client && npm install && npm run dev    # Start frontend
```

## Access Points

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | React app |
| Backend API | http://localhost:3000 | Express server |
| API Docs | http://localhost:3000/api-docs | Swagger UI |
| Health Check | http://localhost:3000/health | Server status |
| MongoDB | localhost:27017 | Database |
| Redis | localhost:6379 | Queue |

## Default Credentials

**Database:**
- MongoDB: `admin` / `password123`
- Redis: No auth (development)

**Test User:**
Create via registration form or API

## Key Commands

```bash
# Server
cd server
npm install           # Install dependencies
npm run dev          # Development with auto-reload
npm start            # Production
npm test             # Run tests

# Client
cd client
npm install           # Install dependencies
npm run dev          # Development with HMR
npm run build        # Production build
npm run preview      # Preview production build
```

## Project Structure

```
/antigravity
├── server/src/
│   ├── app.js           # Entry point
│   ├── config/          # Configs
│   ├── models/          # Mongoose schemas
│   ├── modules/         # API routes & controllers
│   ├── engine/          # ⭐ Core execution engine
│   └── seeder/          # 100+ action definitions
│
└── client/src/
    ├── App.jsx          # Main component
    ├── api/             # API clients
    ├── store/           # Zustand state
    ├── components/      # React components
    │   ├── forms/       # ⭐ DynamicNodeForm
    │   ├── canvas/      # React Flow
    │   └── ui/          # Button, Modal, Card
    └── pages/           # Route pages
```

## API Endpoints

### Authentication
```
POST /api/auth/register    # Create account
POST /api/auth/login       # Sign in
GET  /api/auth/me          # Current user
```

### Actions (Super Admin)
```
GET    /api/actions           # List all actions
GET    /api/actions/:id       # Get action
POST   /api/actions           # Create action
PUT    /api/actions/:id       # Update action
DELETE /api/actions/:id       # Delete action
GET    /api/actions/categories # List categories
```

### Workflows
```
GET    /api/workflows              # List workflows
POST   /api/workflows              # Create workflow
GET    /api/workflows/:id          # Get workflow
PUT    /api/workflows/:id          # Update workflow
DELETE /api/workflows/:id          # Delete workflow
POST   /api/workflows/:id/execute  # Execute workflow
GET    /api/workflows/:id/executions # Execution history
```

### Webhooks (Public)
```
POST /hooks/:webhookId    # Trigger workflow
GET  /hooks/:webhookId    # Trigger workflow (GET)
```

### Organizations
```
GET /api/orgs          # Get organization
PUT /api/orgs          # Update organization
GET /api/orgs/members  # List members
```

## Environment Variables

**Server (.env):**
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://admin:password123@localhost:27017/antigravity?authSource=admin
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
STRIPE_SECRET_KEY=sk_test_...
CLIENT_URL=http://localhost:5173
```

**Client (.env):**
```env
VITE_API_BASE_URL=http://localhost:3000
```

## Common Tasks

### Create Super Admin User
```bash
docker exec -it antigravity_mongodb mongosh -u admin -p password123 --authenticationDatabase admin
use antigravity
db.users.updateOne({email: "user@example.com"}, {$set: {role: "super_admin"}})
```

### View Database
```bash
docker exec -it antigravity_mongodb mongosh -u admin -p password123 --authenticationDatabase admin
use antigravity
db.actiondefinitions.countDocuments()  # Should show 100+
db.users.find().pretty()
db.workflows.find().pretty()
```

### Check Redis Queue
```bash
docker exec -it antigravity_redis redis-cli
KEYS *
LLEN bull:workflow-executions:wait
```

### Test API with curl
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","orgName":"Test Org"}'

# Login (save token)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# List actions
curl http://localhost:3000/api/actions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Architecture Overview

```
User → Frontend (React) → API (Express) → Database (MongoDB)
                              ↓
                         Queue (Redis/BullMQ)
                              ↓
                         Worker → Engine (runner.js)
                                      ↓
                                External APIs
```

## The Meta Model

**ActionDefinition (JSON in MongoDB):**
```javascript
{
  name: "Slack - Send Message",
  category: "Communication",
  apiConfig: {
    method: "POST",
    url: "https://slack.com/api/...",
    headers: {...},
    bodyTemplate: {...}
  },
  inputSchema: [
    { key: "channel", type: "text", label: "Channel" },
    { key: "message", type: "textarea", label: "Message" }
  ]
}
```

**Result:**
- DynamicNodeForm auto-renders inputs
- runner.js executes generically
- No code deployment needed

## Troubleshooting

**MongoDB won't start:**
```bash
docker-compose down
docker volume prune
docker-compose up -d
```

**Port already in use:**
```bash
# Find process
lsof -i :3000
lsof -i :5173

# Kill process
kill -9 <PID>
```

**Actions not loading:**
- Check server console for seeder logs
- Verify MongoDB connection
- Check browser console for errors

**Workflow execution fails:**
- Check server logs
- Verify Redis connection
- Check BullMQ worker is running

## Important Files

| File | Purpose |
|------|---------|
| `server/src/engine/runner.js` | ⭐ Generic execution engine |
| `server/src/seeder/actions.js` | Generates 100+ actions |
| `client/src/components/forms/DynamicNodeForm.jsx` | ⭐ Auto-generates forms |
| `client/src/pages/WorkflowEditor.jsx` | Main canvas |
| `server/src/models/ActionDefinition.js` | Meta schema |

## Documentation

| Document | Purpose |
|----------|---------|
| README.md | Overview & quick start |
| ARCHITECTURE.md | Technical deep dive |
| TESTING_GUIDE.md | Complete testing walkthrough |
| DEPLOYMENT.md | Production deployment |
| DIAGRAM.md | Architecture diagrams |
| SUMMARY.md | Implementation summary |
| QUICK_REFERENCE.md | This document |

## Testing Workflow

1. Start services (`./start.sh`)
2. Open http://localhost:5173
3. Register account
4. Create workflow
5. Drag actions onto canvas
6. Configure nodes
7. Save & execute
8. View execution results

## Deployment Summary

**Development:** Docker Compose + npm scripts
**Staging:** Heroku/Railway + MongoDB Atlas Free
**Production:** AWS/GCP + MongoDB Atlas + Redis Cloud

## Theme Color

**Primary:** `#571B0A`

Used consistently across:
- Buttons
- Headers
- Active states
- React Flow edges
- Brand elements

## Key Features

✅ 100+ pre-built actions
✅ Meta-driven (JSON, not code)
✅ Visual workflow editor
✅ Real-time execution
✅ Webhook triggers
✅ Multi-tenant SaaS
✅ Super Admin dashboard
✅ Variable substitution
✅ Dynamic forms
✅ Queue-based processing

## Support

- Documentation: All .md files in root
- API Docs: http://localhost:3000/api-docs
- Architecture: ARCHITECTURE.md
- Issues: Create GitHub issue

---

**Version:** 1.0.0
**License:** MIT
**Built with:** Node.js 20, React 18, MongoDB, Redis
