import { config } from "dotenv";
config();
import { neon } from "@neondatabase/serverless";

async function connectToDatabase() {
  try {
    const sql = neon(process.env.DATABASE_URL);
    console.log("✓ Successfully connected to Neon");
    return sql;
  } catch (error) {
    console.error("Error connecting to Neon:", error.message);
    throw error;
  }
}

export const sql = await connectToDatabase();