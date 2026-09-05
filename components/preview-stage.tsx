"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Overlay, STATE, PermissionState } from "./overlay";

export default function PreviewStage({
  showId,
  isMobile,
  onGoLive,
}: {
  showId: string;
  isMobile: boolean;
  onGoLive: () => Promise<void>;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [permissionState, setPermissionState] = useState<PermissionState>(
    STATE.IDLE,
  );
  const [errorMessage, setErrorMessage] = useState<string>("");

  // correct useStates for devices picker and deviceIds
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState("");
  const [selectedAudioId, setSelectedAudioId] = useState("");

  // states for facingMode
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [isFlipping, setIsFlipping] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [loading, setLoading] = useState(false);

  // stopStream useCallback function
  const stopStream = useCallback((stream: MediaStream | undefined | null) => {
    if (!stream) return;
    stream.getTracks().forEach((track) => track.stop());
  }, []);

  // attach stream useCallback
  const attachStream = useCallback((stream: MediaStream) => {
    stopStream(streamRef.current);
    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, []);

  const handleGetUserMediaError = (err: any) => {
    if (err.name === "NotAllowedError" || err.name === "SecurityError") {
      setPermissionState(STATE.DENIED);
      setErrorMessage(
        "Camera/mic access was blocked. Enable it in your browser's site settings and reload.",
      );
    } else if (
      err.name === "NotFoundError" ||
      err.name === "DevicesNotFoundError"
    ) {
      setPermissionState(STATE.NO_DEVICE);
      setErrorMessage("No camera or microphone was found on this device.");
    } else if (
      err.name === "NotReadableError" ||
      err.name === "TrackStartError"
    ) {
      setPermissionState(STATE.ERROR);
      setErrorMessage(
        "The camera is already in use by another app or tab. Close it and try again.",
      );
    } else {
      setPermissionState(STATE.ERROR);
      setErrorMessage(
        `Could not access camera/mic: ${err?.message || "Unknown error"}`,
      );
    }
  };

  // enumerate devices
  const enumerate = useCallback(async () => {
    console.log("enumerate devices function get called..", Date.now());
    const all = await navigator.mediaDevices.enumerateDevices();
    const cams = all.filter((d) => d.kind === "videoinput");
    const mics = all.filter((d) => d.kind === "audioinput");
    setVideoDevices(cams);
    setAudioDevices(mics);
    return { cams, mics };
  }, []);

  const onSelectVideo = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    console.log(id);
    setSelectedVideoId(id);
    stopStream(streamRef.current);
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: id } },
        audio: selectedAudioId
          ? { deviceId: { exact: selectedAudioId } }
          : true,
      });

      attachStream(newStream);
      localStorage.setItem(
        "videoDeviceId",
        JSON.stringify({ showId: showId, deviceId: id }),
      );
    } catch (error) {
      console.log(error);
      handleGetUserMediaError(error);
    }
  };

  const onSelectAudio = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    console.log(id);
    setSelectedAudioId(id);
    stopStream(streamRef.current);
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: selectedVideoId
          ? { deviceId: { exact: selectedVideoId } }
          : true,
        audio: { deviceId: { exact: id } },
      });

      attachStream(newStream);
      localStorage.setItem(
        "audioDeviceId",
        JSON.stringify({ showId: showId, deviceId: id }),
      );
    } catch (error) {
      console.log(error);
      handleGetUserMediaError(error);
    }
  };

  // initial camera & audio access and listing devices options
  // useEffect(() => {
  //   let ignore = false;

  //   async function init() {
  //     try {
  //       setPermissionState(STATE.REQUESTING);
  //       const initialStream = await navigator.mediaDevices.getUserMedia({
  //         video: true,
  //         audio: true,
  //       });

  //       if (ignore) {
  //         initialStream.getTracks().forEach((t) => t.stop());
  //         console.log(
  //           "Discarded stale stream:",
  //           initialStream.getTracks().map((t) => t.id),
  //         );
  //         return;
  //       }

  //       attachStream(initialStream);

  //       console.log(
  //         "Active stream tracks:",
  //         initialStream.getTracks().map((t) => `${t.kind}:${t.id}`),
  //       );
  //       setPermissionState(STATE.READY);

  //       const videoTrack = initialStream.getVideoTracks()[0];
  //       const { width, height } = videoTrack.getSettings();

  //       console.log("width:", width);
  //       console.log("height:", height);

  //       // emurateDevice Only for laptop/pc
  //       if (!isMobile) await enumerate();
  //     } catch (error) {
  //       console.log(error);
  //       if (!ignore) handleGetUserMediaError(error);
  //     }
  //   }
  //   init();

  //   return () => {
  //     ignore = true;

  //     console.log("cleanup: unmounting, stopping camera");
  //     if (streamRef.current) {
  //       streamRef.current.getTracks().forEach((t) => {
  //         t.stop();
  //         console.log(`Stopped track: ${t.kind} (${t.label})`);
  //       });
  //       streamRef.current = null;
  //     }
  //   };
  // }, []);

  const handleGoLiveClick = async () => {
    setLoading(true);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // await onGoLive();
    setLoading(false);
  };

  return (
    <>
      <div>
        <header className="w-full h-[62px] flex justify-center items-center bg-black text-blue-200 hidden lg:flex sticky top-0 z-page-header">
          <nav>WELCOME TO KICK</nav>
        </header>
        {/* MAIN COMP */}
        <main className="min-h-screen lg:min-h-0 lg:h-[calc(100vh-62px)] bg-blue-500">
          <div className="bg-neutral-25 px-4 pb-4">
            <div className="block lg:grid gap-4 fixed lg:relative inset-0 lg:py-4 overflow-y-scroll lg:overflow-y-auto h-screen lg:h-[calc(100vh-62px)] lg:min-h-0 items-start mb-4 grid-rows-1 [grid-template-areas:'shop_player_sidebar'] grid-cols-[minmax(230px,1fr)_minmax(500px,2fr)_minmax(250px,1fr)]">
              {/* streamer section - centered one */}
              <div className="flex min-w-0 size-full flex-col gap-2 [grid-area:player]">
                <section className="relative w-full h-full min-h-0 max-h-screen lg:max-h-[calc(100vh-62px)] lg:rounded-2xl overflow-hidden bg-neutral-900 aspect-9/16">
                  {/* render a canvas element to have janky UI */}
                  <div className="flex aspect-9/16 h-full flex-col">
                    <div
                      className="w-full flex-1"
                      style={{
                        position: "relative",
                        width: "100%",
                        height: "100%",
                        overflow: "hidden",
                        backgroundColor: "rgb(0,0,0)",
                      }}
                    >
                      <div className="w-full h-full">
                        <div
                          style={{
                            position: "relative",
                            width: "100%",
                            height: "100%",
                            overflow: "hidden",
                            backgroundColor: "black",
                          }}
                        >
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
