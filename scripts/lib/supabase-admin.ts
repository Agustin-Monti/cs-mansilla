import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../src/types/database";
import * as dotenv from "dotenv";
import path from "path";

// Cargar .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local"
  );
}

export const supabaseAdmin = createClient<Database>(url, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});