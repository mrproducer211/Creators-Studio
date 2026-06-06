import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const dbUrl = process.env.DATABASE_URL || "";
export const isDbConfigured = dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://");

const sql = neon(isDbConfigured ? dbUrl : "postgresql://dummy_user:dummy_password@localhost:5432/dummy_db");
export const db = drizzle(sql, { schema });
