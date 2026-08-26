"use client";

export default function LiveDashboardPage({
  showId,
  isMobile,
  liveShowStatus,
}: {
  showId: string;
  liveShowStatus: "LIVE" | "SCHEDULED";
  isMobile: boolean;
}) {
  return (
    <>
      <div>live dashboard page : {showId}</div>
    </>
  );
}
