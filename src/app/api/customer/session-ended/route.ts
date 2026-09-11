import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing authorization token" },
        { status: 401 }
      );
    }

    const accessToken = authHeader.substring("Bearer ".length);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      console.error("SESSION_ENDED user error:", userError);

      return NextResponse.json(
        { error: "Invalid session" },
        { status: 401 }
      );
    }

    const { data: customerProfile, error: profileError } =
      await supabase
        .from("customer_profiles")
        .select("id, email, company_name")
        .eq("user_id", user.id)
        .maybeSingle();

    if (profileError) {
      console.error(
        "SESSION_ENDED profile error:",
        profileError
      );
    }

    const { error: insertError } = await supabase
  .from("customer_activity_logs")
  .insert({
    user_id: user.id,
    customer_profile_id: customerProfile?.id ?? null,
    company_name: customerProfile?.company_name ?? null,
    customer_email:
      customerProfile?.email ??
      user.email ??
      null,
    action_type: "SESSION_ENDED",
    action_details: {
      method: "browser_close",
    },
  });

    if (insertError) {
      console.error(
        "SESSION_ENDED insert error:",
        insertError
      );

      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("SESSION_ENDED API error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}