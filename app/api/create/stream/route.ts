import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { SessionPayload } from "@/lib/dal";
import prisma from "@/lib/prisma";

interface Body {
  streamDescription: string;
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, message: "No token found", redirectToLogin: true },
      { status: 401 },
    );
  }

  let verifiedToken: SessionPayload;
  try {
    verifiedToken = jwt.verify(
      token,
      process.env.JWT_SECRET!,
    ) as SessionPayload;
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message: "Incorrect or malformed token",
        redirectToLogin: true,
      },
      { status: 401 },
    );
  }

  if (!body.streamDescription?.trim()) {
    return NextResponse.json(
      { success: false, message: "Stream description not found" },
      { status: 400 },
    );
  }

  try {
    const newShow = await prisma.show.create({
      data: {
        showName: body.streamDescription.trim(),
        streamerId: verifiedToken.userId,
        status: "SCHEDULED",
      },
    });
    return NextResponse.json({ success: true, streamId: newShow.id });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: "Failed to create stream" },
      { status: 500 },
    );
  }
}
