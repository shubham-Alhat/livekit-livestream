import LiveDashboardPage from "@/components/live-dashboard";
import { getSession } from "@/lib/dal";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";

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

  const isPreviewStage = liveShow.status === "SCHEDULED";

  // checking if user is on Phone OR Laptop
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "";
  const isMobile = /iPhone|iPad|Android/i.test(userAgent);

  console.log(userAgent);

  return (
    <>
      <LiveDashboardPage
        showId={id}
        isMobile={isMobile}
        liveShowStatus={liveShow.status}
        isPreviewStage={isPreviewStage}
      />
    </>
  );
}
