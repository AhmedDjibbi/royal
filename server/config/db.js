import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/royal-talassa';

const connectDB = async () => {
  let retries = 5;
  while (retries > 0) {
    try {
      const conn = await mongoose.connect(mongoURI);
      console.log(`🏛️  MongoDB Database Connected: ${conn.connection.host}`);
      break;
    } catch (error) {
      console.error(`Error connecting to MongoDB (attempts left: ${retries}): ${error.message}`);
      retries -= 1;
      if (retries === 0) {
        process.exit(1); // Exit server process on critical DB connect failure
      }
      console.log('Waiting 3 seconds before next connection attempt...');
      await new Promise(res => setTimeout(res, 3000));
    }
  }
};

export default connectDB;
