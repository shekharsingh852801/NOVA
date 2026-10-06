import mongoose from "mongoose";

let isConnected = false;

export async function connectDB() {
  if (isConnected) return mongoose.connection;
  
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // If connection fails, log error but don't exit if we want graceful fallback
    // process.exit(1);
    throw error;
  }
}

export function getDB() {
  if (!isConnected) throw new Error("MongoDB connection has not been established");
  return mongoose.connection;
}

export function isDatabaseReady() {
  return isConnected;
}

export async function closeDB() {
  if (!isConnected) return;
  await mongoose.connection.close();
  isConnected = false;
}

export default connectDB;