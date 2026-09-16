"use client";

import { useEffect, useMemo, useState } from "react";
import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";

import "@livekit/components-styles";
import SellerStreamView from "./seller-stream-view";

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

  const audioConfig = useMemo(() => {
    return deviceConfig.audioId && !isMobile
      ? { deviceId: deviceConfig.audioId }
      : true;
  }, []);

  const videoConfig = useMemo(() => {
    return deviceConfig.videoId && !isMobile
      ? { deviceId: deviceConfig.videoId }
      : true;
  }, []);

  if (!deviceConfig.isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        accessing media device...
      </div>
    );
  }

  return (
    <div>
      <LiveKitRoom
        video={videoConfig}
        audio={audioConfig}
        token={token}
        onMediaDeviceFailure={(failure) => {
          console.log("Device failed to load:", failure);

          // clear localstorage
          localStorage.removeItem("audioDeviceId");
          localStorage.removeItem("videoDeviceId");

          // update the states to rerender
          setDeviceConfig((prev) => ({
            ...prev,
            audioId: undefined,
            videoId: undefined,
          }));
        }}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
        connect={true}
        data-lk-theme="default"
      >
        {/* our custom compoenent */}
        <SellerStreamView isMobile={isMobile} showId={showId} token={token} />
        <RoomAudioRenderer />
        {/* <RoomAudioRenderer> is solely responsible for playing the audio of other people in the room. */}
        {/* ever plan to allow "co-hosts" to join the stream, or want to let a buyer join with their microphone to ask a question, the seller will not be able to hear them unless <RoomAudioRenderer> is there. */}
      </LiveKitRoom>
    </div>
  );
}
