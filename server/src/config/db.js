import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

    if (!mongoUri || typeof mongoUri !== "string") {
      console.warn(
        "MongoDB not connected: missing MONGO_URI (or MONGODB_URI). Continuing without DB (schemes endpoints will fail)."
      );
      return;
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    // Don’t crash the whole API server for MVP testing (session/onboarding should still work)
  }
};

export default connectDB;
