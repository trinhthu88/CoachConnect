import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (supabaseInstance) return supabaseInstance;

  const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
  const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase configuration is missing. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your project secrets in the AI Studio settings."
    );
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
}

// Export a proxy or a safe-to-import constant if possible, but lazy getSupabase is safer.
// For backwards compatibility with the existing context, we'll export the instance directly as well
// but handle the initialization check inside the context.
export type UserRole = "admin" | "coach" | "coachee";
export type UserStatus = "pending_approval" | "active" | "suspended" | "rejected";

export const supabase = (function() {
    try {
        return getSupabase();
    } catch (e) {
        console.warn(e);
        return null as any;
    }
})();

// Utility to handle common errors and types
export async function handleSupabaseError<T>(promise: Promise<{ data: T | null; error: any }>): Promise<T> {
  const { data, error } = await promise;
  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "An unexpected database error occurred");
  }
  if (data === null) {
      throw new Error("Resource not found");
  }
  return data;
}
