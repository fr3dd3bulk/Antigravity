# Antigravity - Meta-Driven Automation Platform

> A production-ready n8n clone with SaaS layer and dynamic "Meta-Node" engine where integrations are **data, not code**.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-20.x-green.svg)](https://nodejs.org)
[![React Version](https://img.shields.io/badge/react-18.x-blue.svg)](https://reactjs.org)

## 🎯 What Makes Antigravity Different?

Traditional automation platforms (n8n, Zapier) require developers to write code for each integration. **Antigravity is different.**

- **100+ Integrations**: Auto-generated and stored as JSON in MongoDB
- **No Code Deployment**: Super Admins create new integrations via UI
- **Meta-Driven**: One generic execution engine handles all actions
- **True SaaS**: Multi-tenant architecture built-in from day one

## ✨ Key Features

### For Super Admins
- 🎨 **Action Definition Creator**: Build integrations with a form, no code required
- 📊 **Admin Dashboard**: Manage all 100+ action definitions
- 🔧 **Dynamic Schema**: Define input fields as JSON, UI auto-generates

### For Users
- 🎯 **Visual Workflow Editor**: Drag-and-drop interface powered by React Flow
- 🔌 **100+ Pre-built Actions**: Social, Google, Marketing, Utilities, Communication
- 🔄 **Variable Substitution**: Use `{{input.field}}` and `{{$json.step.data}}`
- 🪝 **Webhook Triggers**: Each workflow gets a unique webhook URL
- ⚡ **BullMQ Queue**: Reliable background job processing

### For Developers
- 🏗️ **Clean Architecture**: Modular monolith with clear separation
- 📚 **Swagger Docs**: Auto-generated API documentation
- 🧪 **Testing Ready**: Jest + Supertest setup included
- 🐳 **Docker Ready**: One-command infrastructure setup

## 🚀 Quick Start

### Automated Setup
```bash
# Clone and run
git clone https://github.com/yourusername/antigravity.git
cd antigravity
chmod +x start.sh
./start.sh
```

### Manual Setup
```bash
# 1. Start infrastructure
docker-compose up -d

# 2. Setup server
cd server
npm install
cp .env.example .env
npm run dev

# 3. Setup client (new terminal)
cd client
npm install
npm run dev
```

**Access:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- API Docs: http://localhost:3000/api-docs

**Default Super Admin Login:**
- Email: `admin@antigravity.dev`
- Password: `admin123`
- ⚠️ **Change this password immediately in production!**

## 🏗️ Tech Stack

### Backend
- **Runtime**: Node.js 20 LTS (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Queue**: Redis + BullMQ
- **Auth**: JWT + bcrypt
- **Payments**: Stripe SDK
- **Docs**: Swagger/OpenAPI

### Frontend
- **Framework**: React 18 (Functional Components + Hooks)
- **Canvas**: React Flow (visual workflow editor)
- **State**: Zustand
- **Routing**: React Router v6
- **Styling**: Tailwind CSS (Theme: #571B0A)
- **HTTP**: Axios

## 📁 Project Structure

```
/antigravity
├── docker-compose.yml          # MongoDB + Redis
├── ARCHITECTURE.md             # Deep dive into meta-driven design
├── TESTING_GUIDE.md           # Complete testing instructions
├── DEPLOYMENT.md              # Production deployment guide
├── start.sh                   # Quick start script
│
├── /server
│   ├── /src
│   │   ├── /config           # Database, Redis, Swagger, Stripe
│   │   ├── /models           # Mongoose schemas
│   │   ├── /modules          # Feature modules (auth, workflows, etc.)
│   │   ├── /engine           # ⭐ Core execution engine
│   │   │   ├── runner.js     # Generic step executor
│   │   │   └── worker.js     # BullMQ processor
│   │   └── /seeder           # 100+ ActionDefinitions generator
│   └── /tests
│
└── /client
    └── /src
        ├── /api              # Axios instances
        ├── /store            # Zustand state management
        ├── /components
        │   ├── /forms        # ⭐ DynamicNodeForm (renders from JSON)
        │   ├── /canvas       # React Flow components
        │   └── /ui           # Reusable UI components
        └── /pages            # Dashboard, WorkflowEditor, Admin
```

## 🎨 The "Meta" Architecture

### Traditional Approach
```javascript
// Each integration = a separate file
class SlackNode {
  async execute() { /* hardcoded logic */ }
}
```

### Antigravity's Approach
```javascript
// Integration = JSON in database
{
  name: "Slack - Send Message",
  apiConfig: { method: "POST", url: "..." },
  inputSchema: [
    { key: "channel", type: "text", label: "Channel" },
    { key: "message", type: "textarea", label: "Message" }
  ]
}

// ONE generic executor handles ALL actions
runner.executeNode(node, previousResults);
```

**Result**: Add integrations via UI, zero code deployment needed!

## 🔧 Core Components Explained

### 1. ActionDefinition (The Meta Schema)
Stored in MongoDB, defines everything about an integration:
- API endpoint and method
- Request headers and body template
- Input fields for user configuration
- Variable placeholders (`{{input.field}}`)

### 2. DynamicNodeForm.jsx (The Magic Form)
Reads `inputSchema` and automatically renders:
- Text inputs
- Textareas
- Dropdowns
- Checkboxes
- Number inputs

**No hardcoded forms!** All driven by JSON.

### 3. Workflow Runner (The Engine)
1. Fetches ActionDefinition from database
2. Substitutes variables: `{{input.channel}}` → `#general`
3. Builds HTTP request
4. Executes via axios
5. Returns results for next step

### 4. BullMQ Worker (The Processor)
- Picks up workflow execution jobs from Redis
- Executes nodes in sequence
- Stores execution results
- Handles retries on failure

## 📚 Documentation

- **[USER_JOURNEY.md](./USER_JOURNEY.md)**: Complete user journey guide with UI flows
- **[ARCHITECTURE.md](./ARCHITECTURE.md)**: Deep dive into meta-driven design
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)**: Complete testing instructions
- **[DEPLOYMENT.md](./DEPLOYMENT.md)**: Production deployment guide
- **[API Docs](http://localhost:3000/api-docs)**: Swagger documentation (when server running)

## 🧪 Testing

```bash
# Run server tests
cd server
npm test

# Manual testing
See TESTING_GUIDE.md for complete walkthrough
```

## 🚢 Deployment

```bash
# Quick summary (see DEPLOYMENT.md for details)

# 1. Set up MongoDB Atlas or managed MongoDB
# 2. Set up Redis Cloud or managed Redis
# 3. Deploy server to Heroku/Railway/Render/VPS
# 4. Deploy client to Vercel/Netlify
# 5. Configure environment variables
# 6. Set up DNS

# Estimated costs: $7-$630/month depending on scale
```

## 🎯 Use Cases

- **Internal Tools**: Automate company workflows
- **Customer Onboarding**: Multi-step automation sequences
- **Data Synchronization**: Keep systems in sync
- **Notification Workflows**: Alert teams across platforms
- **API Orchestration**: Chain multiple API calls
- **ETL Pipelines**: Extract, transform, load data

## 🤝 Contributing

Contributions are welcome! This is a complete, production-ready codebase that demonstrates:
- Clean architecture patterns
- Meta-programming concepts
- Full-stack JavaScript development
- Real-world SaaS features

## 📄 License

MIT License - feel free to use this for learning or building your own automation platform!

## 🙏 Acknowledgments

Inspired by n8n's vision of democratizing automation, but with a unique meta-driven architecture that goes further by making integrations themselves configurable data.

---

**Built with ❤️ and the power of Meta-Programming**

*Theme Color: #571B0A*
