import { getSession } from "@/lib/dal";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import StreamContainer from "@/components/stream-container";
import { AccessToken } from "livekit-server-sdk";

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

  if (liveShow.streamerId !== authUser.userId) redirect("/dashboard");

  if (liveShow.status === "ENDED") redirect(`/dashboard/live/${id}/ended`);

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
        name: authUser.username || "Streamer",
      },
    );
    at.addGrant({
      room: id,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    });
    initialToken = await at.toJwt();
  }

  return (
    <>
      <StreamContainer
        showId={id}
        isMobile={isMobile}
        initialStatus={liveShow.status}
        initialToken={initialToken}
      />
    </>
  );
}
