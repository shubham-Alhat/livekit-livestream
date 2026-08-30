"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";

const STATE = {
  IDLE: "idle",
  REQUESTING: "requesting",
  DENIED: "denied",
  NO_DEVICE: "no_device",
  READY: "ready",
  ERROR: "error",
} as const;

type PermissionState = (typeof STATE)[keyof typeof STATE];

interface StreamOptions {
  videoId?: string;
  audioId?: string;
  facing?: string;
  relaxed?: boolean;
}

function Overlay({
  text,
  tone = "default",
  subtle = false,
}: {
  text: string;
  tone?: "default" | "error";
  subtle?: boolean;
}) {
  return (
    <div
      className={`absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-10 transition-opacity ${
        subtle ? "opacity-75" : "opacity-100"
      }`}
    >
      <p
        className={`text-sm font-medium px-4 text-center ${
          tone === "error" ? "text-red-400" : "text-white"
        }`}
      >
        {text}
      </p>
    </div>
  );
}

export default function LiveDashboardPage({
  showId,
  isMobile,
  liveShowStatus,
  isPreviewStage,
}: {
  showId: string;
  liveShowStatus: "LIVE" | "SCHEDULED";
  isMobile: boolean;
  isPreviewStage: boolean;
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

  // Properly typed the error object
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

  // getConstraints function
  const getConstraints = useCallback(
    ({ videoId, audioId, facing, relaxed }: StreamOptions = {}) => {
      const video = isMobile
        ? { facingMode: relaxed ? facing : { ideal: facing } }
        : videoId
          ? { deviceId: relaxed ? videoId : { exact: videoId } }
          : true;

      const audio = isMobile
        ? true
        : audioId
          ? { deviceId: relaxed ? audioId : { exact: audioId } }
          : true;

      console.log("video constraints:", video);
      console.log("audio constraints:", audio);

      return { video, audio };
    },
    [isMobile],
  );

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

  // startStream function
  const startStream = useCallback(
    async (opts: StreamOptions) => {
      setIsSwitching(true);
      setErrorMessage("");
      try {
        const stream = await navigator.mediaDevices.getUserMedia(
          getConstraints(opts),
        );
        attachStream(stream);
        setPermissionState(STATE.READY);
      } catch (err: any) {
        if (err.name === "OverconstrainedError") {
          try {
            const stream = await navigator.mediaDevices.getUserMedia(
              getConstraints({ ...opts, relaxed: true }),
            );
            attachStream(stream);
            setPermissionState(STATE.READY);
            return;
          } catch (retryErr: any) {
            handleGetUserMediaError(retryErr);
            return;
          }
        }
        handleGetUserMediaError(err);
      } finally {
        setIsSwitching(false);
      }
    },
    [attachStream, getConstraints],
  );

  // initial permission unlock + first preview
  useEffect(() => {
    let cancelled = false;

    async function init() {
      setPermissionState(STATE.REQUESTING);
      try {
        console.log("starting camera..", Date.now());
        const unlockStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        stopStream(unlockStream);
        if (cancelled) return;

        console.log("enumerating devices..", Date.now());
        const { cams, mics } = await enumerate();
        if (cancelled) return;

        if (cams.length === 0) {
          setPermissionState(STATE.NO_DEVICE);
          setErrorMessage("No camera found on this device.");
          return;
        }
        console.log("cams : ", cams);
        console.log("mics : ", mics);
        const defaultVideoId = cams[0].deviceId;
        const defaultAudioId = mics[0]?.deviceId ?? "";
        setSelectedVideoId(defaultVideoId);
        setSelectedAudioId(defaultAudioId);

        await startStream({
          videoId: defaultVideoId,
          audioId: defaultAudioId,
          facing: facingMode,
        });
      } catch (err: any) {
        if (!cancelled) handleGetUserMediaError(err);
      }
    }

    init();

    const onDeviceChange = () => enumerate();
    navigator.mediaDevices.addEventListener("devicechange", onDeviceChange);

    return () => {
      console.log("return cleanup called", Date.now());
      cancelled = true;
      navigator.mediaDevices.removeEventListener(
        "devicechange",
        onDeviceChange,
      );
      stopStream(streamRef.current);
      streamRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="h-screen flex">
        <aside className="w-72 border-r overflow-y-auto">
          <div>Products list</div>
        </aside>
        <div className="w-full max-w-2xl mx-auto text-zinc-100 p-4">
          {isPreviewStage ? (
            <p className="w-full flex justify-center items-center m-1 mb-2">
              preview stage
            </p>
          ) : (
            <div>live..</div>
          )}
          <div className="relative aspect-video w-full h-[80vh] overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800 shadow-lg">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
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
                className="absolute bottom-3 right-3 rounded-full bg-black/60 backdrop-blur px-4 py-2 text-sm font-medium text-white disabled:opacity-50 transition-opacity hover:bg-black/80"
              >
                {false ? "Flipping…" : "Flip camera"}
              </Button>
            )}
          </div>
          {/* select options for audio and video */}
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-300">
              Camera
              <select
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
                // onChange={onSelectAudio}
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
          <div className="w-full flex justify-center items-center mt-2.5">
            <Button className="cursor-pointer" type="button">
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
