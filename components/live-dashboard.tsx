"use client";

import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";

import "@livekit/components-styles";
import SellerStreamView from "./seller-stream-view";
import { VideoPresets } from "livekit-client";

export default function LiveDashboardPage({
  showId,
  isMobile,
  token,
}: {
  showId: string;
  isMobile: boolean;
  token: string;
}) {
  return (
    <div>
      <LiveKitRoom
        video={true}
        options={{
          dynacast: true,
          videoCaptureDefaults: {
            facingMode: "user",
            resolution: VideoPresets.h1080.resolution,
          },
          publishDefaults: {
            simulcast: true,
            videoCodec: "h264",
            videoSimulcastLayers: [VideoPresets.h360, VideoPresets.h720],
          },
        }}
        audio={true}
        token={token}
        onMediaDeviceFailure={(failure) => {
          console.log("Device failed to load:", failure);
        }}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
        connect={true}
        data-lk-theme="default"
      >
        {/* our custom compoenent */}
        <SellerStreamView isMobile={isMobile} showId={showId} token={token} />
        {/* <RoomAudioRenderer /> */}
        {/* <RoomAudioRenderer> is solely responsible for playing the audio of other people in the room. */}
        {/* ever plan to allow "co-hosts" to join the stream, or want to let a buyer join with their microphone to ask a question, the seller will not be able to hear them unless <RoomAudioRenderer> is there. */}
      </LiveKitRoom>
    </div>
  );
}
