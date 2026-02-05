// ============================================
// Keep-Alive API Route
// Simple endpoint to keep Supabase active
// ============================================

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function GET() {
   try {
      // Create Supabase client
      const supabase = createClient(
         process.env.NEXT_PUBLIC_SUPABASE_URL!,
         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );

      // Perform a simple query to keep the database active
      const { data, error } = await supabase
         .from("users") // Using users table for a simple count query
         .select("id", { count: "exact", head: true });

      if (error) {
         console.error("Keep-alive query error:", error);
         return NextResponse.json(
            {
               status: "error",
               message: "Failed to ping Supabase",
               error: error.message,
               timestamp: new Date().toISOString(),
            },
            { status: 500 },
         );
      }

      return NextResponse.json({
         status: "success",
         message: "Supabase is active",
         timestamp: new Date().toISOString(),
      });
   } catch (error) {
      console.error("Keep-alive error:", error);
      return NextResponse.json(
         {
            status: "error",
            message: "Unexpected error",
            timestamp: new Date().toISOString(),
         },
         { status: 500 },
      );
   }
}
