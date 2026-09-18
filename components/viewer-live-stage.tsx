"use client";

import { LiveKitRoom } from "@livekit/components-react";
import ViewerStreamPage from "./viewer-stream";

export default function ViewerLiveStage({ token }: { token: string }) {
  return (
    <>
      <div>
        <LiveKitRoom
          video={false}
          audio={false}
          token={token}
          serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
          connect={true}
          data-lk-theme="default"
        >
          <ViewerStreamPage />
        </LiveKitRoom>
      </div>
    </>
  );
}
