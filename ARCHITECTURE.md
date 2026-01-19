# Antigravity Architecture Documentation

## Overview

Antigravity is a **Meta-Driven Automation Platform** - an n8n clone with a unique architecture where integrations are data (JSON), not code. This allows Super Admins to create 100+ integration steps without writing a single line of code.

## Core Architectural Principles

### 1. The "Meta" Model

**Traditional Approach (n8n, Zapier):**
- Each integration is a separate Node.js file
- Adding new integrations requires deploying new code
- Only developers can add integrations

**Antigravity's Approach:**
- Integrations are stored as JSON in MongoDB (`ActionDefinition` collection)
- Super Admin creates integrations via UI by defining JSON schemas
- Generic execution engine interprets and executes any action
- Zero code deployment for new integrations

### 2. Two-Layer Architecture

#### Layer 1: Super Admin Layer (The Creator)
- Super Admins create `ActionDefinitions` via Admin Dashboard
- Define integration metadata:
  - Name, Category, Logo
  - API Configuration (URL, method, headers)
  - Input Schema (what fields users need to fill)
  - Output Schema (what data the action returns)

#### Layer 2: User/Organization Layer (The Consumer)
- Users see all published `ActionDefinitions`
- Drag actions onto visual canvas
- Configure inputs based on the schema
- Execute workflows

## Key Components

### 1. ActionDefinition Model (The Meta Schema)

```javascript
{
  name: "Slack - Send Message",
  category: "Communication",
  logo: "https://logo.clearbit.com/slack.com",
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
      required: true
    },
    {
      key: "message",
      type: "textarea",
      label: "Message",
      required: true
    }
  ],
  isPublished: true
}
```

### 2. Dynamic Execution Engine (runner.js)

The heart of the meta architecture. It:

1. **Receives a workflow node** with user inputs
2. **Finds the ActionDefinition** from database
3. **Maps user inputs** to the API configuration
4. **Substitutes variables**:
   - `{{input.fieldName}}` → User input values
   - `{{$json.stepName.data}}` → Previous step results
   - `{{credentials.token}}` → Stored credentials
5. **Executes the HTTP request** using axios
6. **Returns the result** for next steps

```javascript
// Simplified execution flow
async executeNode(node, previousResults) {
  // 1. Get the action definition
  const actionDef = await ActionDefinition.findById(node.data.actionId);
  
  // 2. Build request with variable substitution
  const request = this.buildRequest(actionDef, node.data.inputs, previousResults);
  
  // 3. Execute
  const response = await axios(request);
  
  // 4. Return result
  return { success: true, data: response.data };
}
```

### 3. Variable Substitution System

**Input Variables:**
```
{{input.channel}} → User's input for "channel" field
```

**Previous Step Data:**
```
{{$json.httpRequest.data.userId}} → Access data from previous "httpRequest" node
```

**Nested Path Resolution:**
```javascript
getNestedValue({ user: { profile: { name: "John" }}}, "user.profile.name")
// Returns: "John"
```

### 4. Dynamic Form Generator (DynamicNodeForm.jsx)

The most critical frontend component. It:

1. **Receives inputSchema** from ActionDefinition
2. **Dynamically renders** form fields based on schema
3. **Supports field types**:
   - text
   - textarea
   - number
   - boolean (checkbox)
   - select (dropdown)
   - multiselect

```jsx
// Example: ActionDefinition with inputSchema
const inputSchema = [
  { key: 'email', type: 'text', label: 'Email', required: true },
  { key: 'message', type: 'textarea', label: 'Message' },
  { key: 'priority', type: 'select', options: [...] }
];

// DynamicNodeForm automatically renders:
// - Email input field
// - Message textarea
// - Priority dropdown
```

### 5. BullMQ Queue System

Workflow executions are processed asynchronously:

```
User clicks "Execute" 
  → Job added to Redis queue
    → BullMQ Worker picks up job
      → Executes workflow step-by-step
        → Saves execution results to MongoDB
```

Benefits:
- Non-blocking execution
- Retry on failure
- Scalable (multiple workers)
- Reliable (Redis persistence)

## Data Flow

### Workflow Creation Flow

```
1. User creates workflow
2. User drags "Slack - Send Message" from sidebar
3. Frontend fetches ActionDefinition from API
4. Node appears on canvas with:
   - Node ID: node_1234567890
   - Action ID: 60f8a7b2c3d4e5f6g7h8i9j0
   - Inputs: {} (empty initially)
5. User clicks settings icon
6. DynamicNodeForm renders based on inputSchema
7. User fills: channel="#general", message="Hello!"
8. Inputs saved to node.data.inputs
9. Workflow saved to MongoDB
```

### Workflow Execution Flow

```
1. User clicks "Execute"
2. API creates job in BullMQ queue
3. Worker picks up job
4. For each node in workflow:
   a. Fetch ActionDefinition
   b. Build HTTP request with variable substitution
   c. Execute request
   d. Store result
   e. Pass result to next node
5. Save execution record with all step results
6. Update workflow execution count
```

## Database Schema Design

### Collections

1. **actiondefinitions** - The 100+ integration templates
2. **users** - User accounts with roles
3. **organizations** - Multi-tenant SaaS layer
4. **workflows** - User-created workflows (nodes + edges)
5. **executions** - Workflow run history with results

### Relationships

```
User belongsTo Organization
Workflow belongsTo Organization
Workflow hasMany Executions
WorkflowNode references ActionDefinition
```

## Security Model

### Authentication
- JWT-based authentication
- Tokens stored in localStorage (client)
- Bearer token in Authorization header

### Authorization
- **super_admin**: Manage ActionDefinitions
- **org_admin**: Manage organization, invite users
- **member**: Create and execute workflows

### Data Isolation
- All queries filtered by `orgId`
- Users can only access their organization's data
- Webhooks are public but scoped to workflow

## Scalability Considerations

### Horizontal Scaling

**API Servers:**
- Stateless Express servers
- Can run multiple instances behind load balancer
- Session data in Redis (not in-memory)

**Workers:**
- Multiple BullMQ workers can process jobs concurrently
- Set concurrency level per worker
- Scale based on queue length

**Database:**
- MongoDB sharding for large datasets
- Read replicas for read-heavy workloads
- Indexes on frequently queried fields

### Vertical Scaling

- Increase Redis memory for larger queues
- Scale MongoDB resources (Atlas auto-scaling)
- Increase worker concurrency

## Performance Optimizations

### Backend
1. **Mongoose Indexes**: All frequently queried fields are indexed
2. **Lean Queries**: Use `.lean()` when mongoose documents not needed
3. **Pagination**: All list endpoints support pagination
4. **Caching**: Redis can cache ActionDefinitions

### Frontend
1. **React Memo**: CustomNode component uses `memo`
2. **Zustand**: Minimal re-renders with atomic state
3. **React Flow**: Optimized for large graphs
4. **Code Splitting**: Route-based code splitting with React.lazy

## Extension Points

### Adding New Action Types

1. Super Admin creates ActionDefinition via UI
2. Set `apiConfig.url` to `internal://custom-action`
3. Add handler in `runner.js` `executeInternalAction()`:

```javascript
case 'custom-action':
  // Custom logic here
  return { success: true, data: result };
```

### Adding New Input Field Types

1. Add case in `DynamicNodeForm.jsx` `renderInput()`:

```javascript
case 'datetime':
  return <DateTimePicker ... />;
```

### Adding Workflow Triggers

Current triggers:
- Manual (click to execute)
- Webhook (HTTP endpoint)
- Schedule (future: cron)
- Event (future: database event)

## Testing Strategy

### Unit Tests
- `runner.test.js`: Variable substitution logic
- Model tests: Mongoose schema validation

### Integration Tests
- API endpoint tests with Supertest
- Database integration tests

### End-to-End Tests
- Full workflow creation and execution
- User registration and authentication
- Webhook trigger

## Production Considerations

### Code Security
⚠️ **CRITICAL**: `runner.js` uses `eval()` for code execution
- Production should use sandboxed environment (vm2, isolated-vm)
- Or disable code execution action entirely

### Credential Management
- Store API credentials encrypted in database
- Use HashiCorp Vault or AWS Secrets Manager
- Never log credentials

### Rate Limiting
- Implement rate limiting per organization
- Track API calls and execution counts
- Enforce plan limits

### Error Handling
- All API errors return consistent format
- Failed executions are logged with full context
- Webhook errors don't expose internal details

## Future Enhancements

### Planned Features
1. **Credential Store**: Secure credential management
2. **Scheduled Workflows**: Cron-based triggers
3. **Conditional Logic**: If/else branching
4. **Loops**: Iterate over arrays
5. **Sub-workflows**: Call workflows from workflows
6. **Version Control**: Track workflow versions
7. **Collaboration**: Multi-user editing
8. **Marketplace**: Share ActionDefinitions
9. **AI Assistant**: Generate workflows from description
10. **Monitoring Dashboard**: Real-time execution metrics

## Comparison with n8n

| Feature | Antigravity | n8n |
|---------|-------------|-----|
| Integration Type | JSON (Meta) | Code (Files) |
| Add Integration | UI (No Deploy) | Code + Deploy |
| Who Can Add | Super Admin | Developers Only |
| Execution | Generic Engine | Node-specific |
| Multi-tenant | Built-in | Self-hosted only |
| SaaS Ready | Yes | No |
| Learning Curve | Low | Medium |

## Key Innovations

1. **Meta-Driven**: Integrations as data, not code
2. **Dynamic Forms**: UI auto-generated from JSON schema
3. **Generic Executor**: One engine executes all actions
4. **Super Admin Control**: Non-developers can add integrations
5. **True SaaS**: Multi-tenant from day one

## Conclusion

Antigravity's meta-driven architecture represents a paradigm shift in automation platforms. By treating integrations as data rather than code, it enables:

- **Faster innovation**: Add integrations in minutes, not days
- **Lower barrier**: No coding required for new integrations
- **Better scalability**: One codebase serves all actions
- **Easier maintenance**: Update integrations without deployment

This architecture is the foundation for building the next generation of automation platforms.
