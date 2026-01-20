import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import connectDB from './config/database.js';
import { connectRedis } from './config/redis.js';
import { initStripe } from './config/stripe.js';
import swaggerSpec from './config/swagger.js';
import seedActionDefinitions from './seeder/actions.js';
import seedNodeDefinitions from './seeder/nodeDefinitions.js';
import seedSystemData from './seeder/systemData.js';
import seedSuperAdmin from './seeder/superAdmin.js';
import { initQueue, initWorker } from './engine/worker.js';

// Import routes
import authRoutes from './modules/auth/routes.js';
import actionsRoutes from './modules/actions/routes.js';
import workflowsRoutes from './modules/workflows/routes.js';
import webhooksRoutes from './modules/webhooks/routes.js';
import orgsRoutes from './modules/orgs/routes.js';
import subscriptionsRoutes from './modules/subscriptions/routes.js';
import credentialsRoutes from './modules/credentials/routes.js';
import adminRoutes from './modules/admin/routes.js';
import subscriptionsRoutes from './modules/subscriptions/routes.js';
import credentialsRoutes from './modules/credentials/routes.js';
import adminRoutes from './modules/admin/routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/actions', actionsRoutes);
app.use('/api/workflows', workflowsRoutes);
app.use('/api/orgs', orgsRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/credentials', credentialsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/hooks', webhooksRoutes);

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Antigravity API Documentation',
}));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// Initialize and start server
const startServer = async () => {
  try {
    console.log('🚀 Starting Antigravity Server...\n');

    // Connect to MongoDB
    await connectDB();

    // Connect to Redis
    await connectRedis();

    // Initialize Stripe
    initStripe();

    // Seed system data
    await seedSystemData();
    
    // Seed super admin user
    await seedSuperAdmin();
    
    // Seed ActionDefinitions (backward compatibility)
    await seedActionDefinitions();
    
    // Seed NodeDefinitions (new system)
    await seedNodeDefinitions();

    // Initialize BullMQ Queue and Worker
    initQueue();
    initWorker();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`\n✅ Server running on port ${PORT}`);
      console.log(`📖 API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`🔗 Health Check: http://localhost:${PORT}/health\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⚠️  Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⚠️  Shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();

export default app;
