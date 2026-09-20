"use client";

import { LiveKitRoom } from "@livekit/components-react";
import ViewerStreamPage from "./viewer-stream";
import { type RoomOptions } from "livekit-client";

const viewerOptions: RoomOptions = {
  adaptiveStream: {
    pixelDensity: "screen",
  },
};

export default function ViewerLiveStage({ token }: { token: string }) {
  return (
    <>
      <div>
        <LiveKitRoom
          video={false}
          audio={false}
          options={viewerOptions}
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
