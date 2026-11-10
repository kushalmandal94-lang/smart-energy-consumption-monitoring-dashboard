const mongoose = require('mongoose');

// Disable query buffering so operations don't hang when Atlas connection is offline or reconnecting
mongoose.set('bufferCommands', false);

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      throw new Error('MONGO_URI is not defined in environment variables (.env)');
    }

    // Connect to MongoDB Atlas via Mongoose
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 8000, // Timeout after 8s if cluster unreachable
    });

    // Requirement 7 & 8: Display success message and connected database name
    console.log('----------------------------------------------------');
    console.log('✅ MongoDB Connected Successfully!');
    console.log(`📦 Connected Database: ${conn.connection.name}`);
    console.log(`🌐 Cluster Host: ${conn.connection.host}`);
    console.log(`🔌 Connection State: Ready (State ${conn.connection.readyState})`);
    console.log('----------------------------------------------------');

    return conn;
  } catch (error) {
    console.error('----------------------------------------------------');
    console.error('❌ MongoDB Connection Error:', error.message);

    // Requirement 9: Specific Authentication and Network Error Handling
    if (
      error.name === 'MongoServerError' &&
      (error.code === 8000 || error.message.includes('Authentication failed') || error.message.includes('auth failed'))
    ) {
      console.error('🔒 Authentication Error: Bad credentials provided.');
      console.error('👉 Please verify your username and password in backend/.env');
    } else if (
      error.name === 'MongooseServerSelectionError' ||
      error.message.includes('ENOTFOUND') ||
      error.message.includes('ETIMEDOUT') ||
      error.message.includes('querySrv')
    ) {
      console.error('🌐 Network / IP Whitelist Error: Could not reach MongoDB Atlas cluster.');
      console.error('👉 Please ensure your current IP address is whitelisted in MongoDB Atlas (Network Access -> Add IP Address -> Allow Access from Anywhere 0.0.0.0/0 for development).');
    } else if (error.message.includes('Invalid scheme') || error.message.includes('URI')) {
      console.error('⚠️ URI Format Error: Invalid connection string scheme.');
      console.error('👉 Ensure your URI starts with mongodb+srv:// or mongodb://');
    }

    console.error('----------------------------------------------------');
    throw error;
  }
};

module.exports = connectDB;
