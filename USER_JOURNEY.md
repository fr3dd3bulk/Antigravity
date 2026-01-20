# Antigravity User Journey Documentation

This document provides a comprehensive guide to using Antigravity, from initial setup through creating and executing workflows. Screenshots illustrate each step of the user journey.

## Table of Contents
- [Super Admin Journey](#super-admin-journey)
- [Regular User Journey](#regular-user-journey)
- [Workflow Creation](#workflow-creation)
- [Workflow Execution](#workflow-execution)
- [Common Operations](#common-operations)

---

## Super Admin Journey

Super admins have system-wide access and can manage all aspects of Antigravity without belonging to an organization.

### 1. Super Admin Login

**Default Credentials:**
- Email: `admin@antigravity.dev`
- Password: `admin123`
- **⚠️ IMPORTANT:** Change this password immediately in production!

**Login Flow:**
1. Navigate to `http://localhost:5173`
2. Click "Login" 
3. Enter super admin credentials
4. Click "Sign In"

![Super Admin Login](./screenshots/01-super-admin-login.png)
*Screenshot Placeholder: Super admin login page with credentials entered*

---

### 2. Super Admin Dashboard

After logging in, super admins see a comprehensive dashboard with:
- System-wide statistics
- All workflows across all organizations
- Access to admin panel
- No organization restrictions

![Super Admin Dashboard](./screenshots/02-super-admin-dashboard.png)
*Screenshot Placeholder: Super admin dashboard showing system-wide metrics*

---

### 3. Creating Action Definitions (Super Admin Only)

Super admins can create new integrations without writing code:

**Steps:**
1. Navigate to "Admin" → "Actions"
2. Click "Create New Action"
3. Fill in action details:
   - Name: e.g., "Send Slack Message"
   - Category: e.g., "Communication"
   - API Configuration (method, URL, headers)
   - Input Schema (define form fields as JSON)
4. Click "Create"

![Action Definition Creator](./screenshots/03-action-definition-creator.png)
*Screenshot Placeholder: Form for creating a new action definition*

**Example Input Schema:**
```json
[
  {
    "key": "channel",
    "type": "text",
    "label": "Channel Name",
    "required": true,
    "placeholder": "#general"
  },
  {
    "key": "message",
    "type": "textarea",
    "label": "Message",
    "required": true
  }
]
```

![Action Definition List](./screenshots/04-action-definitions-list.png)
*Screenshot Placeholder: List of all action definitions with edit/delete options*

---

### 4. Super Admin Workflow Creation

Super admins can create workflows without an organization:

**Features:**
- ✅ Create workflows globally (no organization required)
- ✅ Access all action definitions
- ✅ View all executions
- ✅ Manage credentials globally

![Super Admin Workflow Editor](./screenshots/05-super-admin-workflow-editor.png)
*Screenshot Placeholder: Workflow editor showing drag-and-drop canvas*

---

## Regular User Journey

Regular users belong to an organization and work within that context.

### 1. User Registration

**Steps:**
1. Navigate to `http://localhost:5173`
2. Click "Sign Up"
3. Fill in registration form:
   - Full Name
   - Email
   - Password
   - Organization Name (automatically created)
4. Click "Create Account"

![User Registration](./screenshots/06-user-registration.png)
*Screenshot Placeholder: Registration form with all fields filled*

---

### 2. User Dashboard

Regular users see organization-specific data:
- Workflows in their organization
- Organization execution history
- Team members
- Organization settings

![User Dashboard](./screenshots/07-user-dashboard.png)
*Screenshot Placeholder: User dashboard showing organization-specific workflows*

---

## Workflow Creation

Both super admins and regular users can create workflows through the visual editor.

### 1. Starting a New Workflow

**Steps:**
1. Click "Workflows" in navigation
2. Click "+ New Workflow" button
3. Enter workflow name and description
4. Click "Create"

![Create Workflow Dialog](./screenshots/08-create-workflow-dialog.png)
*Screenshot Placeholder: Modal dialog for creating new workflow*

---

### 2. Visual Workflow Editor

The workflow editor uses React Flow for visual editing:

**Key Components:**
- **Nodes Panel** (left): Available action types
- **Canvas** (center): Drag-and-drop workflow design
- **Properties Panel** (right): Node configuration
- **Toolbar** (top): Save, execute, settings

![Workflow Editor Interface](./screenshots/09-workflow-editor-interface.png)
*Screenshot Placeholder: Complete workflow editor showing all panels*

---

### 3. Adding Nodes to Workflow

**Steps:**
1. Drag action from nodes panel to canvas
2. Node appears on canvas
3. Click node to configure
4. Properties panel shows input fields

**Node Types:**
- Trigger nodes (webhook, manual, schedule)
- Action nodes (API calls, data processing)
- Conditional nodes (if/then logic)

![Adding Nodes](./screenshots/10-adding-nodes.png)
*Screenshot Placeholder: Dragging a node from panel to canvas*

---

### 4. Configuring Node Inputs

Each node's configuration is dynamically generated from its action definition:

**Dynamic Form Example:**
```
Node: "Send Slack Message"
├── Channel: #general
├── Message: Hello from Antigravity!
└── Use Credential: [Select credential]
```

![Node Configuration](./screenshots/11-node-configuration.png)
*Screenshot Placeholder: Node properties panel with input fields filled*

---

### 5. Using Variable Substitution

Antigravity supports powerful variable substitution:

**Variable Types:**
- `{{input.fieldName}}` - From trigger data
- `{{$json.previousNode.data}}` - From previous node output
- `{{$json.stepName.field}}` - From specific step

**Example:**
```
Message: "User {{input.userName}} signed up at {{input.timestamp}}"
```

![Variable Substitution](./screenshots/12-variable-substitution.png)
*Screenshot Placeholder: Input field showing variable syntax with autocomplete*

---

### 6. Connecting Nodes

**Steps:**
1. Click on source node's output handle (right side)
2. Drag to target node's input handle (left side)
3. Connection appears as arrow/line
4. Execution flows in direction of arrow

![Connecting Nodes](./screenshots/13-connecting-nodes.png)
*Screenshot Placeholder: Two nodes being connected with mouse drag*

---

### 7. Saving the Workflow

**Steps:**
1. Click "Save" button in toolbar
2. Success notification appears
3. Workflow is now ready for execution

![Workflow Saved](./screenshots/14-workflow-saved.png)
*Screenshot Placeholder: Workflow editor with save confirmation toast*

---

## Workflow Execution

### 1. Manual Execution

For workflows with manual triggers:

**Steps:**
1. Open workflow in editor
2. Click "Execute" button
3. (Optional) Enter trigger data in JSON format
4. Click "Run"
5. Execution starts and appears in execution history

![Manual Execution](./screenshots/15-manual-execution.png)
*Screenshot Placeholder: Execution dialog with trigger data input*

---

### 2. Webhook Execution

For workflows with webhook triggers:

**Automatic Setup:**
1. Add webhook trigger node to workflow
2. System generates unique webhook URL
3. Copy webhook URL
4. Configure external system to POST to URL

**Webhook URL Format:**
```
https://your-domain.com/hooks/wh_randomstring123
```

![Webhook Configuration](./screenshots/16-webhook-configuration.png)
*Screenshot Placeholder: Webhook node showing generated URL with copy button*

---

### 3. Execution History

View all workflow executions:

**Information Shown:**
- Execution ID
- Status (Success, Failed, Running)
- Start time
- Duration
- Triggered by (user, webhook, schedule)

**Steps to View:**
1. Click on workflow
2. Click "Executions" tab
3. See list of all executions
4. Click execution to see details

![Execution History](./screenshots/17-execution-history.png)
*Screenshot Placeholder: List of workflow executions with status indicators*

---

### 4. Execution Details

Drill down into individual execution:

**Shows:**
- Overall status
- Each step's status, input, output
- Errors (if any)
- Execution timeline
- Duration per step

![Execution Details](./screenshots/18-execution-details.png)
*Screenshot Placeholder: Detailed execution view with step-by-step breakdown*

---

## Common Operations

### 1. Managing Credentials

Credentials are encrypted and stored securely:

**Creating a Credential:**
1. Navigate to "Credentials"
2. Click "+ New Credential"
3. Select credential type (API Key, OAuth2, Basic Auth)
4. Enter credential data
5. Click "Save"

![Credential Management](./screenshots/19-credential-management.png)
*Screenshot Placeholder: Credential creation form with encryption notice*

---

### 2. Testing Credentials

Before using in workflows:

**Steps:**
1. Go to credential details
2. Click "Test Connection"
3. System verifies credential
4. Shows success/failure message

![Test Credential](./screenshots/20-test-credential.png)
*Screenshot Placeholder: Credential test result showing success*

---

### 3. Workflow Templates (Future Feature)

Save and reuse common workflow patterns.

---

### 4. Team Collaboration

For organization members:

**Features:**
- View team members
- Share workflows
- Collaborative editing (coming soon)
- Access control per workflow

![Team Members](./screenshots/21-team-members.png)
*Screenshot Placeholder: List of organization members with roles*

---

## API Access

### Using the Swagger Documentation

Antigravity provides auto-generated API documentation:

**Access:**
1. Navigate to `http://localhost:3000/api-docs`
2. Browse available endpoints
3. Test endpoints directly in browser
4. View request/response schemas

![API Documentation](./screenshots/22-api-documentation.png)
*Screenshot Placeholder: Swagger UI showing API endpoints*

---

### Key API Endpoints

**Authentication:**
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

**Workflows:**
- `GET /api/workflows` - List workflows
- `POST /api/workflows` - Create workflow
- `PUT /api/workflows/:id` - Update workflow
- `DELETE /api/workflows/:id` - Delete workflow
- `POST /api/workflows/:id/execute` - Execute workflow

**Admin (Super Admin Only):**
- `GET /api/admin/stats` - System statistics
- `POST /api/actions` - Create action definition
- `GET /api/admin/users` - List all users
- `GET /api/admin/organizations` - List all organizations

---

## Troubleshooting

### Common Issues

**1. Workflow Won't Execute**
- Check all nodes are connected
- Verify credentials are valid
- Check execution logs for errors

**2. Variable Substitution Not Working**
- Ensure correct syntax: `{{input.field}}`
- Verify previous node has executed
- Check field names match exactly

**3. Webhook Not Triggering**
- Verify webhook URL is correct
- Check external system is sending POST requests
- Review webhook logs

**4. Super Admin Can't Create Workflows**
- ✅ Fixed! Super admins no longer need an organization
- They can create workflows globally

---

## Best Practices

### Workflow Design
1. **Keep workflows focused** - One workflow, one purpose
2. **Use descriptive names** - For nodes and workflows
3. **Add error handling** - Use error workflows
4. **Test incrementally** - Test each node as you build

### Security
1. **Never hardcode credentials** - Always use credential manager
2. **Use environment-specific credentials** - Dev vs. prod
3. **Regularly rotate API keys**
4. **Review execution logs** - Monitor for suspicious activity

### Performance
1. **Minimize node count** - Combine operations when possible
2. **Use async where appropriate** - Don't wait when you don't have to
3. **Monitor execution times** - Identify bottlenecks
4. **Set appropriate timeouts**

---

## Advanced Features

### 1. Conditional Logic

Use conditional nodes to create branching workflows.

### 2. Loops and Iterations

Process arrays of data with loop nodes.

### 3. Error Workflows

Configure workflows to run when errors occur.

### 4. Scheduled Executions

Run workflows on a schedule (cron syntax).

---

## Getting Help

### Resources
- **Documentation**: [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Testing Guide**: [TESTING_GUIDE.md](./TESTING_GUIDE.md)
- **Deployment**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **API Docs**: http://localhost:3000/api-docs (when server running)

### Support
- Create an issue on GitHub
- Check existing documentation
- Review example workflows

---

## Conclusion

Antigravity empowers users to build powerful automation workflows without code. The meta-driven architecture means new integrations can be added through the UI, making it infinitely extensible.

**Key Takeaways:**
- ✅ Super admins work globally without organizations
- ✅ Regular users work within their organization context
- ✅ Visual editor makes workflow creation intuitive
- ✅ Variable substitution enables dynamic workflows
- ✅ Encrypted credential storage keeps secrets safe
- ✅ BullMQ ensures reliable execution
- ✅ Meta-driven design = zero-code deployment of new integrations

**Next Steps:**
1. Start the application: `./start.sh`
2. Login as super admin
3. Create your first workflow
4. Add action definitions as needed
5. Build amazing automations!

---

*Last Updated: 2026-01-20*
*Version: 1.0.0*
