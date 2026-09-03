"use server";

import { getSession } from "@/lib/dal";
import prisma from "@/lib/prisma";
import { AccessToken } from "livekit-server-sdk";

export async function goLive(showId: string) {
  try {
    // authenticate the user
    const authUser = await getSession();
    if (!authUser) {
      return { success: false, message: "Session expired, Please Login.." };
    }

    // check if user is owner of this show
    const thisShow = await prisma.show.findUnique({
      where: {
        id: showId,
      },
    });

    if (!thisShow) {
      return { success: false, message: "show not found" };
    }

    if (thisShow.streamerId !== authUser.userId) {
      return { success: false, message: "Unauthorized access to this show!" };
    }

    // generating livekit token
    const token = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      { identity: authUser.userId, name: authUser.username },
    );

    token.addGrant({
      roomJoin: true,
      room: showId,
      canPublish: true,
      canSubscribe: true, // so they can see chat/data channels
    });

    // update the status of auction
    const updatedShow = await prisma.show.update({
      where: {
        id: showId,
        streamerId: authUser.userId,
      },
      data: {
        status: "LIVE",
      },
    });

    return {
      success: true,
      message: "Live auction started!",
      token: await token.toJwt(),
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "error in goLive server action",
    };
  }
}
