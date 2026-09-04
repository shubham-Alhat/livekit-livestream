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
  initialToken,
}: {
  showId: string;
  initialStatus: "SCHEDULED" | "LIVE" | "ENDED";
  isMobile: boolean;
  initialToken: string | undefined;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [token, setToken] = useState<string | undefined>(initialToken);

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
}
