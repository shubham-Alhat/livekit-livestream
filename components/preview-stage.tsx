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
  useEffect(() => {
    let ignore = false;

    async function init() {
      try {
        setPermissionState(STATE.REQUESTING);
        const initialStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (ignore) {
          initialStream.getTracks().forEach((t) => t.stop());
          console.log(
            "Discarded stale stream:",
            initialStream.getTracks().map((t) => t.id),
          );
          return;
        }

        attachStream(initialStream);

        console.log(
          "Active stream tracks:",
          initialStream.getTracks().map((t) => `${t.kind}:${t.id}`),
        );
        setPermissionState(STATE.READY);

        // emurateDevice Only for laptop/pc
        if (!isMobile) await enumerate();
      } catch (error) {
        console.log(error);
        if (!ignore) handleGetUserMediaError(error);
      }
    }
    init();

    return () => {
      ignore = true;

      console.log("cleanup: unmounting, stopping camera");
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => {
          t.stop();
          console.log(`Stopped track: ${t.kind} (${t.label})`);
        });
        streamRef.current = null;
      }
    };
  }, []);

  const handleGoLiveClick = async () => {
    setLoading(true);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    await onGoLive();
    setLoading(false);
  };

  return (
    <>
      <div className="h-screen flex">
        <aside className="w-72 border-r overflow-y-auto">
          <div>Products list</div>
        </aside>
        <div className="w-full max-w-2xl mx-auto text-zinc-100 p-4">
          <p className="w-full flex justify-center items-center m-1 mb-2">
            preview stage
          </p>

          <div className="relative aspect-video w-full h-[80vh] overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800 shadow-lg">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-contain"
            />

            {permissionState === STATE.REQUESTING && (
              <Overlay text="Requesting camera access…" />
            )}
            {isSwitching && permissionState === STATE.READY && (
              <Overlay text="Switching device…" subtle />
            )}
            {permissionState === STATE.DENIED && (
              <Overlay text={errorMessage} tone="error" />
            )}
            {permissionState === STATE.NO_DEVICE && (
              <Overlay text={errorMessage} tone="error" />
            )}
            {permissionState === STATE.ERROR && (
              <Overlay text={errorMessage} tone="error" />
            )}
            {isMobile && (
              <Button
                // onClick={flipCamera}
                // disabled={isFlipping}
                className="absolute bottom-3 right-3 rounded-full bg-black/60 backdrop-blur px-4 py-2 text-sm font-medium text-white disabled:opacity-50 transition-opacity hover:bg-black/80 cursor-pointer"
              >
                {false ? "Flipping…" : "Flip camera"}
              </Button>
            )}
          </div>
          {/* select options for audio and video */}
          {!isMobile && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-300">
                Camera
                <select
                  onChange={onSelectVideo}
                  value={selectedVideoId}
                  className="rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {videoDevices.map((d) => (
                    <option key={d.deviceId} value={d.deviceId}>
                      {d.label || `Camera ${d.deviceId.slice(0, 6)}`}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-300">
                Microphone
                <select
                  value={selectedAudioId}
                  onChange={onSelectAudio}
                  className="rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {audioDevices.map((d) => (
                    <option key={d.deviceId} value={d.deviceId}>
                      {d.label || `Mic ${d.deviceId.slice(0, 6)}`}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
          <div className="w-full flex justify-center items-center mt-2.5">
            <Button
              disabled={loading}
              onClick={handleGoLiveClick}
              className="cursor-pointer"
              type="button"
            >
              Go Live
            </Button>
          </div>
        </div>
        <aside className="w-96 border-l flex flex-col">
          <div>Chat system</div>
          total live count : {0}
        </aside>
      </div>
    </>
  );
}
