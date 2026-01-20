# Screenshots Directory

This directory contains UI screenshots for the Antigravity user journey documentation.

## Required Screenshots

To complete the user journey documentation, take screenshots of the following:

### Super Admin Flow
1. `01-super-admin-login.png` - Super admin login page with credentials
2. `02-super-admin-dashboard.png` - Super admin dashboard view
3. `03-action-definition-creator.png` - Form for creating action definitions
4. `04-action-definitions-list.png` - List of all action definitions
5. `05-super-admin-workflow-editor.png` - Workflow editor as super admin

### Regular User Flow
6. `06-user-registration.png` - User registration form
7. `07-user-dashboard.png` - Regular user dashboard view

### Workflow Creation
8. `08-create-workflow-dialog.png` - New workflow creation modal
9. `09-workflow-editor-interface.png` - Complete workflow editor UI
10. `10-adding-nodes.png` - Dragging nodes to canvas
11. `11-node-configuration.png` - Node properties panel
12. `12-variable-substitution.png` - Variable syntax in inputs
13. `13-connecting-nodes.png` - Connecting nodes with arrows
14. `14-workflow-saved.png` - Save confirmation

### Workflow Execution
15. `15-manual-execution.png` - Manual execution dialog
16. `16-webhook-configuration.png` - Webhook URL display
17. `17-execution-history.png` - List of executions
18. `18-execution-details.png` - Detailed execution view

### Common Operations
19. `19-credential-management.png` - Credential creation form
20. `20-test-credential.png` - Credential test result
21. `21-team-members.png` - Organization members list
22. `22-api-documentation.png` - Swagger UI

## How to Take Screenshots

### Setup
1. Start the application:
   ```bash
   ./start.sh
   ```

2. Wait for both server and client to be running:
   - Backend: http://localhost:3000
   - Frontend: http://localhost:5173
   - API Docs: http://localhost:3000/api-docs

### Taking Screenshots

**Tools:**
- Mac: Command + Shift + 4
- Windows: Windows + Shift + S
- Linux: gnome-screenshot or similar

**Guidelines:**
- Use full browser window (not full screen)
- Include browser chrome (address bar) to show URLs
- Ensure readable text (no tiny fonts)
- Hide personal/sensitive information
- Use consistent browser window size
- Capture at 1920x1080 or similar resolution

### Example Workflow for Screenshots

1. **Login & Dashboard** (1-2, 6-7)
   - Take screenshots of login page
   - Take screenshots of dashboard after login
   - Do this for both super admin and regular user

2. **Admin Features** (3-4)
   - Login as super admin
   - Navigate to Admin > Actions
   - Take screenshots of action creation

3. **Workflow Editor** (8-14)
   - Create a new workflow
   - Screenshot the creation dialog
   - Add nodes to the workflow
   - Configure nodes
   - Connect nodes
   - Save workflow
   - Screenshot each step

4. **Execution** (15-18)
   - Execute the workflow
   - View execution history
   - View execution details
   - Screenshot each view

5. **Other Features** (19-22)
   - Create credentials
   - Test credentials
   - View team members
   - Open API docs

## Screenshot Naming Convention

Use the exact names listed above to match the references in USER_JOURNEY.md:
- Use two-digit numbering: `01`, `02`, etc.
- Use lowercase with hyphens: `super-admin-login`
- Use PNG format for clarity
- Keep file sizes reasonable (< 500KB each)

## After Taking Screenshots

1. Place all screenshots in this directory
2. Verify all 22 screenshots are present
3. Check that they match the references in USER_JOURNEY.md
4. Commit screenshots to the repository

## Missing Screenshots Note

**Current Status:** 📸 Screenshots need to be captured

To get started:
```bash
# Start the application
cd /path/to/Antigravity
./start.sh

# Wait for services to start
# Then follow the screenshot guide above
```

The application will automatically:
- Create a super admin user (admin@antigravity.dev / admin123)
- Seed action definitions
- Be ready for screenshots

---

*Last Updated: 2026-01-20*
