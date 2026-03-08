import mongoose from "mongoose";

const connectDB = async () => {
  mongoose.set("bufferCommands", false);
  mongoose.connection.on("connected", () => console.log("Database Connected"));
  mongoose.connection.on("error", (err) =>
    console.error("Database connection error:", err.message),
  );
  const mongoUrl = process.env.MONGODB_URL;
  if (!mongoUrl) {
    throw new Error("MONGODB_URL is not set");
  }
  await mongoose.connect(`${mongoUrl}/codeU-auth`, {
    serverSelectionTimeoutMS: 5000,
  });
};

export default connectDB;
