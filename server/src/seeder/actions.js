import ActionDefinition from '../models/ActionDefinition.js';

/**
 * Generates 100+ ActionDefinitions programmatically
 * Categories: Social (20), Google (20), Marketing (20), Utilities (20+)
 */

const seedActionDefinitions = async () => {
  try {
    // Check if actions already exist
    const count = await ActionDefinition.countDocuments();
    if (count > 0) {
      console.log(`ℹ️  ${count} ActionDefinitions already exist. Skipping seeder.`);
      return;
    }

    console.log('🌱 Seeding ActionDefinitions...');

    const actions = [];

    // SOCIAL MEDIA (20 actions)
    const socialPlatforms = ['Facebook', 'Twitter', 'LinkedIn', 'Instagram', 'TikTok'];
    const socialActions = ['Post Message', 'Delete Post', 'Get Profile', 'Upload Media'];
    
    socialPlatforms.forEach((platform) => {
      socialActions.forEach((action) => {
        actions.push({
          name: `${platform} - ${action}`,
          category: 'Social',
          logo: `https://logo.clearbit.com/${platform.toLowerCase()}.com`,
          description: `${action} on ${platform}`,
          apiConfig: {
            method: action.includes('Get') ? 'GET' : 'POST',
            url: `https://api.${platform.toLowerCase()}.com/v1/${action.toLowerCase().replace(' ', '-')}`,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer {{credentials.access_token}}',
            },
            bodyTemplate: action.includes('Post') ? { message: '{{input.message}}' } : {},
          },
          inputSchema: action.includes('Post') ? [
            {
              key: 'message',
              type: 'textarea',
              label: 'Message',
              placeholder: 'Enter your message',
              required: true,
            },
          ] : action.includes('Upload') ? [
            {
              key: 'media_url',
              type: 'text',
              label: 'Media URL',
              placeholder: 'https://example.com/image.jpg',
              required: true,
            },
          ] : [],
          isPublished: true,
        });
      });
    });

    // GOOGLE SERVICES (20 actions)
    const googleServices = [
      { name: 'Sheets', actions: ['Create Spreadsheet', 'Add Row', 'Get Rows', 'Update Cell', 'Delete Row'] },
      { name: 'Drive', actions: ['Upload File', 'Create Folder', 'List Files', 'Delete File'] },
      { name: 'Gmail', actions: ['Send Email', 'Get Emails', 'Mark as Read', 'Create Draft', 'Delete Email'] },
      { name: 'Calendar', actions: ['Create Event', 'List Events', 'Update Event', 'Delete Event'] },
    ];

    googleServices.forEach((service) => {
      service.actions.forEach((action) => {
        const inputSchemas = {
          'Create Spreadsheet': [{ key: 'title', type: 'text', label: 'Spreadsheet Title', required: true }],
          'Add Row': [
            { key: 'spreadsheet_id', type: 'text', label: 'Spreadsheet ID', required: true },
            { key: 'values', type: 'textarea', label: 'Row Values (JSON)', required: true },
          ],
          'Send Email': [
            { key: 'to', type: 'text', label: 'To', required: true },
            { key: 'subject', type: 'text', label: 'Subject', required: true },
            { key: 'body', type: 'textarea', label: 'Body', required: true },
          ],
          'Create Event': [
            { key: 'summary', type: 'text', label: 'Event Title', required: true },
            { key: 'start', type: 'text', label: 'Start Time', required: true },
            { key: 'end', type: 'text', label: 'End Time', required: true },
          ],
          'Upload File': [
            { key: 'name', type: 'text', label: 'File Name', required: true },
            { key: 'content', type: 'textarea', label: 'File Content', required: true },
          ],
        };

        actions.push({
          name: `Google ${service.name} - ${action}`,
          category: 'Google',
          logo: `https://www.google.com/s2/favicons?domain=google.com&sz=128`,
          description: `${action} in Google ${service.name}`,
          apiConfig: {
            method: action.includes('Get') || action.includes('List') ? 'GET' : 'POST',
            url: `https://www.googleapis.com/${service.name.toLowerCase()}/v1/${action.toLowerCase().replace(' ', '-')}`,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer {{credentials.access_token}}',
            },
            bodyTemplate: {},
          },
          inputSchema: inputSchemas[action] || [],
          isPublished: true,
        });
      });
    });

    // MARKETING PLATFORMS (20 actions)
    const marketingPlatforms = [
      { name: 'Mailchimp', actions: ['Add Subscriber', 'Remove Subscriber', 'Create Campaign', 'Send Campaign', 'Get Lists'] },
      { name: 'HubSpot', actions: ['Create Contact', 'Update Contact', 'Get Contact', 'Create Deal', 'Update Deal'] },
      { name: 'Salesforce', actions: ['Create Lead', 'Update Lead', 'Get Lead', 'Create Opportunity', 'Update Opportunity'] },
      { name: 'SendGrid', actions: ['Send Email', 'Get Email Stats', 'Add Contact', 'Create List', 'Delete Contact'] },
    ];

    marketingPlatforms.forEach((platform) => {
      platform.actions.forEach((action) => {
        const commonInputs = action.includes('Create') || action.includes('Add') ? [
          { key: 'email', type: 'text', label: 'Email Address', required: true },
          { key: 'name', type: 'text', label: 'Name', required: false },
        ] : action.includes('Update') ? [
          { key: 'id', type: 'text', label: 'Record ID', required: true },
          { key: 'data', type: 'textarea', label: 'Update Data (JSON)', required: true },
        ] : [];

        actions.push({
          name: `${platform.name} - ${action}`,
          category: 'Marketing',
          logo: `https://logo.clearbit.com/${platform.name.toLowerCase()}.com`,
          description: `${action} in ${platform.name}`,
          apiConfig: {
            method: action.includes('Get') ? 'GET' : 'POST',
            url: `https://api.${platform.name.toLowerCase()}.com/v1/${action.toLowerCase().replace(' ', '-')}`,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer {{credentials.api_key}}',
            },
            bodyTemplate: {},
          },
          inputSchema: commonInputs,
          isPublished: true,
        });
      });
    });

    // UTILITIES (20+ actions)
    const utilities = [
      {
        name: 'HTTP Request',
        description: 'Make a custom HTTP request',
        apiConfig: {
          method: 'POST',
          url: '{{input.url}}',
          headers: {},
          bodyTemplate: {},
        },
        inputSchema: [
          { key: 'method', type: 'select', label: 'Method', required: true, options: [
            { label: 'GET', value: 'GET' },
            { label: 'POST', value: 'POST' },
            { label: 'PUT', value: 'PUT' },
            { label: 'DELETE', value: 'DELETE' },
          ]},
          { key: 'url', type: 'text', label: 'URL', required: true },
          { key: 'body', type: 'textarea', label: 'Request Body (JSON)', required: false },
        ],
      },
      {
        name: 'Wait',
        description: 'Pause workflow execution',
        apiConfig: {
          method: 'POST',
          url: 'internal://wait',
          headers: {},
          bodyTemplate: {},
        },
        inputSchema: [
          { key: 'duration', type: 'number', label: 'Duration (seconds)', required: true, defaultValue: 5 },
        ],
      },
      {
        name: 'Code',
        description: 'Execute custom JavaScript code',
        apiConfig: {
          method: 'POST',
          url: 'internal://code',
          headers: {},
          bodyTemplate: {},
        },
        inputSchema: [
          { key: 'code', type: 'textarea', label: 'JavaScript Code', required: true, placeholder: 'return { result: 1 + 1 };' },
        ],
      },
      {
        name: 'Split',
        description: 'Split workflow into multiple branches',
        apiConfig: {
          method: 'POST',
          url: 'internal://split',
          headers: {},
          bodyTemplate: {},
        },
        inputSchema: [
          { key: 'branches', type: 'number', label: 'Number of Branches', required: true, defaultValue: 2 },
        ],
      },
      {
        name: 'Merge',
        description: 'Merge multiple workflow branches',
        apiConfig: {
          method: 'POST',
          url: 'internal://merge',
          headers: {},
          bodyTemplate: {},
        },
        inputSchema: [],
      },
    ];

    // Add more utility actions
    const utilityTemplates = [
      'JSON Parser', 'XML Parser', 'CSV Parser', 'Base64 Encode', 'Base64 Decode',
      'Hash Generator', 'Random Number', 'Date Formatter', 'String Manipulator', 'Array Filter',
      'Object Mapper', 'Conditional Router', 'Aggregator', 'Deduplicator', 'Validator',
    ];

    utilityTemplates.forEach((template) => {
      utilities.push({
        name: template,
        description: `${template} utility`,
        apiConfig: {
          method: 'POST',
          url: `internal://${template.toLowerCase().replace(' ', '-')}`,
          headers: {},
          bodyTemplate: {},
        },
        inputSchema: [
          { key: 'input', type: 'textarea', label: 'Input Data', required: true },
        ],
      });
    });

    utilities.forEach((utility) => {
      actions.push({
        name: utility.name,
        category: 'Utilities',
        logo: 'https://via.placeholder.com/128/571B0A/FFFFFF?text=U',
        description: utility.description,
        apiConfig: utility.apiConfig,
        inputSchema: utility.inputSchema,
        isPublished: true,
      });
    });

    // COMMUNICATION (10 actions)
    const communicationPlatforms = ['Slack', 'Discord', 'Telegram', 'WhatsApp', 'Teams'];
    const commActions = ['Send Message', 'Get Messages'];

    communicationPlatforms.forEach((platform) => {
      commActions.forEach((action) => {
        actions.push({
          name: `${platform} - ${action}`,
          category: 'Communication',
          logo: `https://logo.clearbit.com/${platform.toLowerCase()}.com`,
          description: `${action} on ${platform}`,
          apiConfig: {
            method: action.includes('Get') ? 'GET' : 'POST',
            url: `https://api.${platform.toLowerCase()}.com/v1/${action.toLowerCase().replace(' ', '-')}`,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer {{credentials.token}}',
            },
            bodyTemplate: {},
          },
          inputSchema: action.includes('Send') ? [
            { key: 'channel', type: 'text', label: 'Channel/Chat ID', required: true },
            { key: 'message', type: 'textarea', label: 'Message', required: true },
          ] : [],
          isPublished: true,
        });
      });
    });

    // Insert all actions
    await ActionDefinition.insertMany(actions);

    console.log(`✅ Successfully seeded ${actions.length} ActionDefinitions`);
  } catch (error) {
    console.error('❌ Error seeding ActionDefinitions:', error.message);
    throw error;
  }
};

export default seedActionDefinitions;
