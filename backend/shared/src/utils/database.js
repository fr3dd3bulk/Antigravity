import mongoose from 'mongoose';
import logger from './logger.js';

export async function connectDatabase() {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/n8n-clone';
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    logger.info('Database connected successfully', { uri: mongoURI });
    
    mongoose.connection.on('error', (err) => {
      logger.error('Database error', { error: err.message });
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('Database disconnected');
    });
    
    return mongoose.connection;
  } catch (error) {
    logger.error('Database connection failed', { error: error.message });
    throw error;
  }
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
  logger.info('Database disconnected');
}
