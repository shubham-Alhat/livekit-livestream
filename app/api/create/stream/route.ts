import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  console.log(token);

  console.log("body:", body);
  return NextResponse.json({ body, message: "Hellow world" });
}
