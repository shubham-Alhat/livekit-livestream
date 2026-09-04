"use client";

import { useEffect, useState } from "react";
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from "@livekit/components-react";

// for default styling
import "@livekit/components-styles";

type SavedDevice = { showId: string; deviceId: string };

export default function LiveDashboardPage({
  showId,
  isMobile,
  token,
}: {
  showId: string;
  isMobile: boolean;
  token: string;
}) {
  const [deviceConfig, setDeviceConfig] = useState<{
    audioId?: string;
    videoId?: string;
    isLoaded: boolean;
  }>({ isLoaded: false });

  // get the correct parse object from localStorage
  function getSavedDevice(key: string): SavedDevice | undefined {
    const raw = localStorage.getItem(key);
    if (!raw) return undefined;
    try {
      return JSON.parse(raw) as SavedDevice;
    } catch {
      return undefined;
    }
  }

  useEffect(() => {
    const audioDevice = getSavedDevice("audioDeviceId");
    const videoDevice = getSavedDevice("videoDeviceId");

    const savedAudioId = audioDevice?.deviceId
      ? audioDevice.deviceId
      : undefined;

    const savedVideoId = videoDevice?.deviceId
      ? videoDevice.deviceId
      : undefined;

    console.log(savedAudioId, "-----------", savedVideoId);

    setDeviceConfig({
      audioId: savedAudioId,
      videoId: savedVideoId,
      isLoaded: true,
    });
  }, []);

  if (!deviceConfig.isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        accessing media device...
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-gray-900">
      <LiveKitRoom
        video={deviceConfig.videoId ? { deviceId: deviceConfig.videoId } : true}
        audio={deviceConfig.audioId ? { deviceId: deviceConfig.audioId } : true}
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
        connect={true}
        data-lk-theme="default"
      >
        {/* <VideoConference /> */}
        {/* our custom compoenent */}
        {/* <RoomAudioRenderer> is solely responsible for playing the audio of other people in the room. */}
        {/* ever plan to allow "co-hosts" to join the stream, or want to let a buyer join with their microphone to ask a question, the seller will not be able to hear them unless <RoomAudioRenderer> is there. */}
      </LiveKitRoom>
    </div>
  );
}
