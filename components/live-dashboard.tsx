"use client";
import { PreJoin } from "@livekit/components-react";
export default function LiveDashboardPage({ showId }: { showId: string }) {
  return (
    <>
      <div>live dashboard page : {showId}</div>
      <PreJoin />
    </>
  );
}
