# Antigravity - System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                          ANTIGRAVITY PLATFORM                               │
│                     Meta-Driven Automation Platform                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              LAYER 1: CLIENTS                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Web Browser    │     │   Mobile App     │     │   Webhook Call   │
│                  │     │   (Future)       │     │   (External)     │
│  React 18 SPA    │     │                  │     │                  │
│  React Flow      │     │                  │     │  HTTP POST/GET   │
│  Tailwind CSS    │     │                  │     │                  │
└────────┬─────────┘     └────────┬─────────┘     └────────┬─────────┘
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  │
                              HTTP/REST
                                  │
┌─────────────────────────────────────────────────────────────────────────────┐
│                          LAYER 2: API GATEWAY                               │
└─────────────────────────────────────────────────────────────────────────────┘

                        ┌─────────────────────┐
                        │  Express.js Server  │
                        │  (Node.js 20 LTS)   │
                        │                     │
                        │  ┌───────────────┐  │
                        │  │ CORS Middleware│ │
                        │  │ JWT Auth      │  │
                        │  │ Rate Limiting │  │
                        │  │ Error Handler │  │
                        │  └───────────────┘  │
                        └──────────┬──────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         │                         │                         │
         ▼                         ▼                         ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│  /api/auth      │   │  /api/workflows │   │  /hooks/:id     │
│  - register     │   │  - list         │   │  - trigger      │
│  - login        │   │  - create       │   │  (public)       │
│  - me           │   │  - update       │   │                 │
└─────────────────┘   │  - execute      │   └─────────────────┘
                      │  - delete       │
┌─────────────────┐   └─────────────────┘   ┌─────────────────┐
│  /api/actions   │                         │  /api/orgs      │
│  - list         │   ┌─────────────────┐   │  - get          │
│  - get          │   │  /api-docs      │   │  - update       │
│  - create *     │   │  Swagger UI     │   │  - members      │
│  - update *     │   │  OpenAPI Spec   │   └─────────────────┘
│  - delete *     │   └─────────────────┘
└─────────────────┘
    (* Super Admin Only)

┌─────────────────────────────────────────────────────────────────────────────┐
│                       LAYER 3: BUSINESS LOGIC                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                    ⭐ THE META ENGINE (Core Innovation)                     │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────┐     │
│  │  runner.js - Generic Execution Engine                             │     │
│  │                                                                    │     │
│  │  executeNode(node, previousResults) {                             │     │
│  │    1. Fetch ActionDefinition from MongoDB                         │     │
│  │    2. Substitute variables:                                       │     │
│  │       - {{input.field}} → User input values                       │     │
│  │       - {{$json.step.data}} → Previous step results              │     │
│  │    3. Build HTTP request from apiConfig                           │     │
│  │    4. Execute request via axios                                   │     │
│  │    5. Return result                                               │     │
│  │  }                                                                 │     │
│  │                                                                    │     │
│  │  Built-in Actions:                                                │     │
│  │  - HTTP Request    - Wait            - Code                       │     │
│  │  - Split           - Merge           - Utilities                  │     │
│  └───────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────┐     │
│  │  worker.js - BullMQ Job Processor                                 │     │
│  │                                                                    │     │
│  │  processWorkflow(job) {                                           │     │
│  │    1. Fetch workflow from MongoDB                                 │     │
│  │    2. Create execution record                                     │     │
│  │    3. For each node in workflow:                                  │     │
│  │       - Execute via runner.executeNode()                          │     │
│  │       - Store step result                                         │     │
│  │       - Pass result to next node                                  │     │
│  │    4. Update execution status (success/failed)                    │     │
│  │    5. Update workflow stats                                       │     │
│  │  }                                                                 │     │
│  │                                                                    │     │
│  │  Features:                                                         │     │
│  │  - Retry on failure (3 attempts)                                  │     │
│  │  - Concurrent execution (5 jobs)                                  │     │
│  │  - Error logging                                                  │     │
│  └───────────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                      LAYER 4: DATA LAYER                                    │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────┐              ┌─────────────────────────┐
│      MongoDB Atlas      │              │      Redis Cloud        │
│                         │              │                         │
│  Collections:           │              │  Usage:                 │
│  ┌───────────────────┐  │              │  ┌───────────────────┐  │
│  │ users             │  │              │  │ BullMQ Queue      │  │
│  │ organizations     │  │              │  │ Job State         │  │
│  │ actiondefinitions │◄─┼──────────────┼─►│ Session Cache     │  │
│  │ workflows         │  │              │  │ Rate Limiting     │  │
│  │ executions        │  │              │  └───────────────────┘  │
│  └───────────────────┘  │              │                         │
│                         │              │  Queue:                 │
│  Indexes:               │              │  workflow-executions    │
│  - email (unique)       │              │                         │
│  - orgId                │              │  Concurrency: 5         │
│  - category             │              │  Retry: 3 attempts      │
│  - webhookId            │              └─────────────────────────┘
└─────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                    LAYER 5: EXTERNAL SERVICES                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│    Stripe    │  │    Slack     │  │   Google     │  │   Various    │
│              │  │              │  │   Workspace  │  │   APIs       │
│  - Billing   │  │  - Messages  │  │              │  │              │
│  - Payments  │  │  - Channels  │  │  - Sheets    │  │  100+ More   │
│  - Webhooks  │  │              │  │  - Gmail     │  │  Integrations│
└──────────────┘  └──────────────┘  │  - Calendar  │  └──────────────┘
                                    │  - Drive     │
                                    └──────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                       DATA FLOW: Creating a Workflow                        │
└─────────────────────────────────────────────────────────────────────────────┘

USER                    FRONTEND                BACKEND              DATABASE
 │                         │                       │                    │
 │ Create Workflow         │                       │                    │
 ├────────────────────────►│ POST /api/workflows  │                    │
 │                         ├──────────────────────►│                    │
 │                         │                       │ INSERT workflow    │
 │                         │                       ├───────────────────►│
 │                         │                       │◄───────────────────┤
 │                         │◄──────────────────────┤ workflow doc       │
 │                         │                       │                    │
 │ Drag "Slack Message"    │                       │                    │
 ├────────────────────────►│                       │                    │
 │                         │ GET /api/actions/:id  │                    │
 │                         ├──────────────────────►│                    │
 │                         │                       │ FIND ActionDef     │
 │                         │                       ├───────────────────►│
 │                         │                       │◄───────────────────┤
 │                         │◄──────────────────────┤ ActionDefinition   │
 │                         │                       │ + inputSchema      │
 │ DynamicNodeForm         │                       │                    │
 │ renders automatically   │                       │                    │
 ├────────────────────────►│                       │                    │
 │                         │                       │                    │
 │ Configure inputs        │                       │                    │
 ├────────────────────────►│                       │                    │
 │                         │ PUT /api/workflows/:id│                    │
 │                         ├──────────────────────►│ UPDATE workflow    │
 │                         │                       ├───────────────────►│
 │                         │◄──────────────────────┤                    │
 │                         │                       │                    │
 │ Execute Workflow        │                       │                    │
 ├────────────────────────►│ POST /workflows/:id/  │                    │
 │                         │      execute          │                    │
 │                         ├──────────────────────►│ Add job to Redis   │
 │                         │                       ├───────────────────►│
 │                         │◄──────────────────────┤ (BullMQ)          │
 │                         │ {jobId: "123"}        │                    │
 │                                                 │                    │
 │                                        ┌────────┴──────────┐         │
 │                                        │  BullMQ Worker    │         │
 │                                        │  picks up job     │         │
 │                                        │  executes nodes   │         │
 │                                        │  via runner.js    │         │
 │                                        └───────────────────┘         │
 │                                                 │                    │
 │                                                 │ INSERT execution   │
 │                                                 ├───────────────────►│
 │                                                 │ UPDATE workflow    │
 │                                                 ├───────────────────►│

┌─────────────────────────────────────────────────────────────────────────────┐
│                  THE META MODEL: ActionDefinition                           │
└─────────────────────────────────────────────────────────────────────────────┘

{
  _id: ObjectId("..."),
  name: "Slack - Send Message",
  category: "Communication",
  logo: "https://logo.clearbit.com/slack.com",
  description: "Send a message to a Slack channel",
  
  apiConfig: {
    method: "POST",
    url: "https://slack.com/api/chat.postMessage",
    headers: {
      "Authorization": "Bearer {{credentials.token}}",
      "Content-Type": "application/json"
    },
    bodyTemplate: {
      channel: "{{input.channel}}",
      text: "{{input.message}}"
    }
  },
  
  inputSchema: [
    {
      key: "channel",
      type: "text",
      label: "Channel ID",
      placeholder: "#general",
      required: true
    },
    {
      key: "message",
      type: "textarea",
      label: "Message",
      placeholder: "Enter your message",
      required: true
    }
  ],
  
  outputSchema: [
    { key: "ts", type: "string", description: "Timestamp" },
    { key: "ok", type: "boolean", description: "Success status" }
  ],
  
  isPublished: true,
  createdBy: ObjectId("..."),
  createdAt: ISODate("2026-01-19T10:00:00Z")
}

This single JSON document enables:
✅ Dynamic form generation (DynamicNodeForm.jsx reads inputSchema)
✅ Generic execution (runner.js builds request from apiConfig)
✅ No code deployment (Super Admin creates via UI)
✅ Immediate availability (Published to all users instantly)

┌─────────────────────────────────────────────────────────────────────────────┐
│                           SECURITY LAYERS                                   │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  Layer 1: Network Security                                           │
│  - CORS (configured origins)                                         │
│  - HTTPS (production)                                                │
│  - Rate Limiting (TODO: implement)                                   │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  Layer 2: Authentication                                             │
│  - JWT tokens (7 day expiry)                                         │
│  - bcrypt password hashing (10 rounds)                               │
│  - Token stored in localStorage (client)                             │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  Layer 3: Authorization                                              │
│  - Role-based access (super_admin, org_admin, member)                │
│  - Organization isolation (all queries filtered by orgId)            │
│  - Public webhooks (authenticated by webhookId)                      │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  Layer 4: Data Security                                              │
│  - MongoDB authentication                                            │
│  - Redis password (production)                                       │
│  - Environment variables (no secrets in code)                        │
└──────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         DEPLOYMENT ARCHITECTURE                             │
└─────────────────────────────────────────────────────────────────────────────┘

Production Setup:

┌──────────────┐
│  Cloudflare  │  CDN + DDoS Protection
└──────┬───────┘
       │
┌──────▼───────┐
│   Vercel     │  React Frontend (Static)
└──────┬───────┘
       │ HTTPS
┌──────▼───────┐
│ Load Balancer│  Nginx / AWS ALB
└──────┬───────┘
       │
       ├──────┬──────┬──────┐
       │      │      │      │
    ┌──▼──┐ ┌▼──┐ ┌▼──┐ ┌▼──┐
    │API 1│ │API│ │API│ │API│  Express Servers (Auto-scaling)
    └──┬──┘ └┬──┘ └┬──┘ └┬──┘
       │     │     │     │
       └─────┴─────┴─────┘
             │
       ┌─────┴─────┐
       │           │
    ┌──▼──────┐ ┌─▼────────┐
    │MongoDB  │ │  Redis   │  Managed Databases
    │ Atlas   │ │  Cloud   │
    └─────────┘ └──────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              KEY METRICS                                    │
└─────────────────────────────────────────────────────────────────────────────┘

Performance:
- API Response Time: < 100ms (average)
- Workflow Execution: Depends on external APIs
- Queue Processing: 5 concurrent jobs per worker
- Database Queries: All indexed fields

Scalability:
- API Servers: Horizontal (stateless)
- Workers: Horizontal (multi-instance)
- Database: Vertical + Sharding
- Queue: Redis cluster

Capacity:
- Users: Unlimited (multi-tenant)
- Workflows: Unlimited per organization
- ActionDefinitions: Currently 100+, extensible
- Executions: Limited by storage

┌─────────────────────────────────────────────────────────────────────────────┐
│                              INNOVATION                                     │
└─────────────────────────────────────────────────────────────────────────────┘

Traditional platforms:  Integration = Code File
Antigravity:           Integration = JSON Document

This paradigm shift enables:
✅ Non-developers to create integrations
✅ Zero code deployment for new integrations
✅ Instant availability across all organizations
✅ One generic engine instead of N specialized handlers
✅ UI auto-generation from schema
✅ True SaaS multi-tenancy

The Meta-Driven architecture is the future of automation platforms.

```
