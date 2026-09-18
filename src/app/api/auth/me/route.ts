import { NextResponse } from "next/server";
import { AuthError, requireAppUser } from "@/domain/authorization/identity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await requireAppUser(request);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("Failed to resolve authenticated user", error);
    return NextResponse.json({ error: "Authentication check failed." }, { status: 500 });
  }
}
