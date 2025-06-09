// lib/supabase/admin.ts
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/src/types/database.types";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default supabase;
