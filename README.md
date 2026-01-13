# n8n Clone - Production-Grade Workflow Automation Platform

A complete, production-ready workflow automation platform built with the MERN stack (MongoDB, Express, React, Node.js). This is a fully functional clone of n8n with enterprise-grade features including multi-tenancy, RBAC, subscriptions, and a powerful workflow execution engine.

## 🚀 Features

### Core Features
- **Visual Workflow Editor** - Drag-and-drop interface powered by React Flow
- **20+ Built-in Nodes** - Triggers, actions, conditions, AI nodes, and utilities
- **DAG-Based Execution Engine** - Topological sorting with parallel execution support
- **Multi-Tenancy** - Complete organization isolation with role-based access control
- **Subscription Management** - Stripe integration with usage tracking
- **Webhook Support** - Dynamic webhook endpoints for workflow triggers
- **Cron Scheduling** - Time-based workflow execution
- **Real-time Execution Logs** - Track workflow progress in real-time
- **Version Control** - Automatic workflow versioning
- **Credential Management** - AES-256 encrypted credential vault

### Architecture
- **Microservices Design** - Separate services for API, Workers, and Scheduler
- **Horizontal Scalability** - Stateless workers with BullMQ job queues
- **Production-Ready** - Docker Compose orchestration with health checks
- **Security First** - JWT auth, rate limiting, encryption, RBAC

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Architecture Overview](#architecture-overview)
3. [Services](#services)
4. [Node System](#node-system)
5. [Workflow Engine](#workflow-engine)
6. [API Endpoints](#api-endpoints)
7. [Environment Variables](#environment-variables)
8. [Development](#development)
9. [Extending the Platform](#extending-the-platform)
10. [Production Deployment](#production-deployment)

## 🎯 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 20+ (for local development)

### Running with Docker

1. Clone the repository:
```bash
git clone <repository-url>
cd Complete-n8n-clone
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Start all services:
```bash
docker compose up
```

4. Access the application:
- Frontend: http://localhost:3001
- API: http://localhost:3000
- MongoDB: localhost:27017
- Redis: localhost:6379

5. Default admin credentials:
- Email: admin@example.com
- Password: admin123

## 🏗 Architecture Overview

```
┌─────────────────┐      ┌─────────────────┐
│   Frontend      │◄─────┤   API Service   │
│   (React)       │      │   (Express)     │
└─────────────────┘      └────────┬────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
              ┌─────▼─────┐ ┌────▼─────┐ ┌────▼──────┐
              │  Worker   │ │ Worker   │ │ Scheduler │
              │  Service  │ │ Service  │ │  Service  │
              └─────┬─────┘ └────┬─────┘ └─────┬─────┘
                    │            │             │
                    └────────────┼─────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
              ┌─────▼──────┐          ┌──────▼─────┐
              │  MongoDB   │          │   Redis    │
              │ (Database) │          │  (Queue)   │
              └────────────┘          └────────────┘
```

### Components

**Frontend (React + Redux + React Flow)**
- Visual workflow editor
- Real-time execution monitoring
- Organization and user management
- Admin panel

**API Service (Express)**
- RESTful API endpoints
- Authentication & authorization
- Webhook handling
- Workflow management
- Subscription management

**Worker Service (BullMQ)**
- Stateless workflow execution
- Parallel job processing
- Retry and timeout handling
- Credential decryption

**Scheduler Service (node-cron)**
- Cron-based triggers
- Time-based workflow execution
- Automatic workflow scheduling

**Database (MongoDB)**
- All persistent data
- Workflow definitions
- Execution history
- User and organization data

**Queue (Redis)**
- BullMQ job queues
- Rate limiting
- Caching layer

## 🔧 Services

### API Service
**Port:** 3000  
**Purpose:** Main backend API

**Endpoints:**
- `/api/auth` - Authentication
- `/api/organizations` - Organization management
- `/api/workflows` - Workflow CRUD
- `/api/executions` - Execution management
- `/api/nodes` - Node definitions
- `/api/credentials` - Credential vault
- `/api/admin` - Admin operations
- `/api/webhooks` - Webhook triggers

### Worker Service
**Purpose:** Execute workflows in parallel

**Features:**
- Stateless execution
- Configurable concurrency
- Automatic retry
- Error handling
- Execution logging

**Configuration:**
```env
WORKER_CONCURRENCY=10
EXECUTION_TIMEOUT=300000
```

### Scheduler Service
**Purpose:** Trigger scheduled workflows

**Features:**
- Cron expression support
- Interval-based scheduling
- Automatic workflow discovery
- Periodic refresh

## 🧩 Node System

### Available Node Types

#### Triggers (5)
- **Webhook** - HTTP webhook triggers
- **Cron** - Cron schedule triggers
- **Schedule** - Interval-based triggers
- **Manual** - Manual execution
- **Event** - External event triggers

#### Actions (6)
- **HTTP Request** - Make API calls
- **Send Email** - SMTP email delivery
- **Send SMS** - SMS messaging
- **Database Query** - MongoDB operations
- **Delay** - Wait/pause execution
- **Set Data** - Data transformation

#### Conditions (5)
- **IF** - Conditional branching
- **Switch** - Multiple path routing
- **Split** - Parallel path creation
- **Merge** - Path consolidation
- **Loop** - Iteration over items

#### Utilities (3)
- **JavaScript** - Sandboxed code execution
- **JSON Parser** - JSON manipulation
- **Formatter** - String formatting

#### AI/LLM (2)
- **Text Summarize** - AI text summarization
- **Content Generate** - AI content generation

### Creating Custom Nodes

Extend the Node SDK to create custom nodes:

```javascript
import { ActionNode } from '@n8n-clone/node-sdk';

export class MyCustomNode extends ActionNode {
  constructor() {
    super({
      id: 'my-custom-node',
      name: 'My Custom Node',
      type: 'my-custom-node',
      category: 'action',
      description: 'Does something awesome',
      color: '#FF6B6B',
      shape: 'rectangle',
      properties: [
        {
          name: 'message',
          displayName: 'Message',
          type: 'string',
          required: true
        }
      ]
    });
  }

  async execute(context) {
    const message = this.getNodeParameter(context, 'message');
    return {
      success: true,
      data: { message }
    };
  }
}
```

## ⚙️ Workflow Engine

### DAG Validation
- Cycle detection
- Node connectivity validation
- Trigger node validation

### Execution Features
- **Topological Sorting** - Determines optimal execution order
- **Parallel Execution** - Executes independent branches simultaneously
- **Conditional Paths** - Dynamic path selection
- **Error Handling** - Graceful error recovery
- **State Persistence** - Saves execution progress
- **Resume Support** - Can restart from failure point

### Execution Context
Each node receives:
- Input data from previous nodes
- Workflow metadata
- Credentials (decrypted)
- Execution ID
- User context

## 📡 API Endpoints

### Authentication
```
POST /api/auth/register - Register new user
POST /api/auth/login - Login
GET  /api/auth/me - Get current user
```

### Workflows
```
GET    /api/organizations/:orgId/workflows - List workflows
POST   /api/organizations/:orgId/workflows - Create workflow
GET    /api/organizations/:orgId/workflows/:id - Get workflow
PUT    /api/organizations/:orgId/workflows/:id - Update workflow
DELETE /api/organizations/:orgId/workflows/:id - Delete workflow
POST   /api/organizations/:orgId/workflows/:id/activate - Activate
POST   /api/organizations/:orgId/workflows/:id/deactivate - Deactivate
```

### Executions
```
POST /api/organizations/:orgId/executions/workflows/:id/execute - Execute workflow
GET  /api/organizations/:orgId/executions - List executions
GET  /api/organizations/:orgId/executions/:id - Get execution details
POST /api/organizations/:orgId/executions/:id/cancel - Cancel execution
```

### Webhooks
```
ALL /api/webhooks/:webhookPath - Webhook endpoint
```

## 🔐 Environment Variables

### Required Variables
```env
# Application
NODE_ENV=development
API_PORT=3000
FRONTEND_PORT=3001

# Database
MONGO_URI=mongodb://mongo:27017/n8n-clone

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Security
JWT_SECRET=your-super-secret-jwt-key
ENCRYPTION_KEY=your-32-character-encryption-key!!

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password

# Super Admin
SUPER_ADMIN_EMAIL=admin@example.com
SUPER_ADMIN_PASSWORD=admin123

# Worker
WORKER_CONCURRENCY=10
EXECUTION_TIMEOUT=300000
```

### Optional Variables
```env
# Stripe (for subscriptions)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# URLs
API_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3001
```

## 💻 Development

### Local Setup (Without Docker)

1. Install dependencies:
```bash
npm install
```

2. Start MongoDB and Redis:
```bash
# Using Docker for databases only
docker compose up mongo redis
```

3. Start services:
```bash
# Terminal 1 - API
cd services/api
npm install
npm start

# Terminal 2 - Worker
cd services/worker
npm install
npm start

# Terminal 3 - Scheduler
cd services/scheduler
npm install
npm start

# Terminal 4 - Frontend
cd services/frontend
npm install
npm run dev
```

### Project Structure
```
.
├── packages/
│   ├── shared/          # Shared models and utilities
│   ├── node-sdk/        # Node SDK for custom nodes
│   └── engine/          # Workflow execution engine
├── services/
│   ├── api/             # API service
│   ├── worker/          # Worker service
│   ├── scheduler/       # Scheduler service
│   └── frontend/        # React frontend
├── docker-compose.yml   # Docker orchestration
└── .env.example         # Environment template
```

## 🔌 Extending the Platform

### Adding New Nodes

1. Create node class in `packages/node-sdk/src/nodes/`
2. Export from appropriate category index
3. Add to main index in `packages/node-sdk/src/index.js`
4. Register in execution engine
5. Add node definition to database initialization

### Adding New API Endpoints

1. Create controller in `services/api/src/controllers/`
2. Create route in `services/api/src/routes/`
3. Add route to main router in `services/api/src/routes/index.js`
4. Add middleware as needed (auth, RBAC, validation)

## 🚀 Production Deployment

### Production Checklist

- [ ] Change all default passwords and secrets
- [ ] Configure proper MongoDB replica set
- [ ] Setup Redis persistence
- [ ] Configure HTTPS/SSL
- [ ] Setup monitoring and logging
- [ ] Configure backup strategy
- [ ] Setup rate limiting
- [ ] Configure CORS properly
- [ ] Enable production error tracking
- [ ] Setup horizontal scaling for workers

### Docker Production

```bash
# Build for production
docker compose -f docker-compose.prod.yml build

# Deploy
docker compose -f docker-compose.prod.yml up -d

# Scale workers
docker compose -f docker-compose.prod.yml up -d --scale worker=5
```

### Environment Best Practices

- Use strong, unique secrets
- Enable MongoDB authentication
- Configure Redis password
- Use HTTPS in production
- Implement backup strategy
- Monitor resource usage
- Setup alerting

## 📊 Subscription Plans

Four predefined plans:

**Free**
- 5 workflows
- 2 active workflows
- 100 executions/month
- 1 concurrent execution

**Starter** ($29/month)
- 20 workflows
- 10 active workflows
- 1,000 executions/month
- 3 concurrent executions
- 14-day trial

**Pro** ($99/month)
- Unlimited workflows
- 50 active workflows
- 10,000 executions/month
- 10 concurrent executions
- 14-day trial

**Enterprise** ($499/month)
- Unlimited workflows
- Unlimited active workflows
- Unlimited executions
- 50 concurrent executions
- 30-day trial

## 🛡 Security Features

- **AES-256 Encryption** - All credentials encrypted at rest
- **JWT Authentication** - Secure token-based auth
- **RBAC** - Role-based access control
- **Organization Isolation** - Strict multi-tenancy
- **Rate Limiting** - API and webhook protection
- **Audit Logs** - Complete activity tracking
- **Input Validation** - All inputs sanitized
- **Sandboxed Execution** - JavaScript nodes run in VM2 sandbox

## 📝 License

MIT License

## 🙏 Acknowledgments

Inspired by n8n, Zapier, and other workflow automation platforms.

---

**Built with ❤️ using MERN Stack, React Flow, BullMQ, and Redis**
