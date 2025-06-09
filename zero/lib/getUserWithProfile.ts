import { supabase } from "@/lib/supabase";

export async function getUserWithProfile() {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("ismanager")
      .eq("id", user.id)
      .single();

    if (profileData) {
      return { ...user, ismanager: profileData.ismanager };
    }
  }

  return null;
}