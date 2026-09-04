"use client";

import { useState } from "react";
import PreviewStage from "./preview-stage";
import LiveDashboardPage from "./live-dashboard";
import { goLive } from "@/actions/show";
import { toast } from "sonner";

export default function StreamContainer({
  showId,
  initialStatus,
  isMobile,
}: {
  showId: string;
  initialStatus: "SCHEDULED" | "LIVE" | "ENDED";
  isMobile: boolean;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [token, setToken] = useState<string | null>(null);

  // We pass this function down to PreviewStage
  const handleGoLive = async () => {
    try {
      const response = await goLive(showId);

      if (!response.success) {
        toast.error(response.message);
        return;
      }

      if (!response.token) {
        toast.error("Livekit token not found");
        return;
      }

      setToken(response.token);
      setStatus("LIVE");
      console.log("GoLive response : ", response);
    } catch (error) {
      console.error("Failed to go live:", error);
    }
  };

  if (status === "SCHEDULED") {
    return (
      <PreviewStage
        showId={showId}
        isMobile={isMobile}
        onGoLive={handleGoLive}
      />
    );
  }

  if (status === "LIVE" && token) {
    return (
      <LiveDashboardPage showId={showId} isMobile={isMobile} token={token} />
    );
  }

  return <div>Loading...</div>;
  // return (
  //   <>
  //     <LiveDashboardPage
  //       showId={showId}
  //       isMobile={isMobile}
  //       token="shubham-token"
  //     />
  //   </>
  // );
}
