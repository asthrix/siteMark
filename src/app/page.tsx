import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function RootPage() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is logged in, show the dashboard
  // If not, redirect to login page
  if (!user) {
    redirect("/login");
  }

  // User is authenticated - redirect to dashboard
  // The (dashboard) route group handles the main app
  redirect("/dashboard");
}
