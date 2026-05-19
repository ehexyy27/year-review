import { NextRequest, NextResponse } from "next/server";
import { checkEmailExists } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ exists: false });
    }

    const exists = await checkEmailExists(email.trim().toLowerCase());
    return NextResponse.json({ exists });
  } catch {
    // If Supabase is not configured or fails, allow the user to proceed
    return NextResponse.json({ exists: false });
  }
}
