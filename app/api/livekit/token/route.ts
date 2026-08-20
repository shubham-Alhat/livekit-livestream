import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get("room");
  const role = searchParams.get("role");

  return NextResponse.json({
    message: "Hello from Next.js!",
    role: role,
    room: roomId,
  });
}
