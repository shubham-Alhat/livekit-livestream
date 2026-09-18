import ViewerLiveStage from "@/components/viewer-live-stage";

import { getSession } from "@/lib/dal";
import prisma from "@/lib/prisma";

import { AccessToken } from "livekit-server-sdk";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  console.log("stream Id : ", id);

  const authUser = await getSession();

  if (!authUser) redirect("/login");

  const liveShow = await prisma.show.findUnique({
    where: {
      id: id,
    },
  });

  if (!liveShow) notFound();

  if (liveShow.status === "ENDED") redirect(`/live/${id}/ended`);

  // checking if user is on Phone OR Laptop
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "";
  const isMobile = /iPhone|iPad|Android/i.test(userAgent);

  console.log(userAgent);

  let initialToken: string | undefined = undefined;

  if (liveShow.status === "LIVE") {
    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY!,
      process.env.LIVEKIT_API_SECRET!,
      {
        identity: authUser.userId,
        name: authUser.username || "buyer",
      },
    );
    at.addGrant({
      room: id,
      roomJoin: true,
      canPublish: false,
      canSubscribe: true,
    });
    initialToken = await at.toJwt();
  }

  if (!initialToken) {
    redirect(`/live/${id}/access-token-error`);
  }

  return (
    <>
      <ViewerLiveStage token={initialToken} />
    </>
  );
}
