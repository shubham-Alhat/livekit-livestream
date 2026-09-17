"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { STATE, PermissionState, Overlay } from "./overlay";
import { cn } from "@/lib/utils";

export default function Preview({
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
  const [shouldMirror, setShouldMirror] = useState<boolean>(false);
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

    const track = stream.getVideoTracks()[0];
    const settings = track.getSettings();

    console.log("facingMode : ", settings.facingMode);

    // Only mirror if the browser confirms it's an actual front-facing camera.
    // External/virtual cams (iPhone via Continuity, OBS, Camo, etc.) report
    // facingMode as undefined — never auto-mirror those.
    setShouldMirror(settings.facingMode === "user");

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

  const handleToggleCamera = async () => {
    if (!streamRef.current) return;

    stopStream(streamRef.current);

    setIsFlipping(true);
    const newFacingMode = facingMode === "user" ? "environment" : "user";

    setFacingMode(newFacingMode);

    try {
      const newVideoStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: newFacingMode } },
        audio: true,
      });

      attachStream(newVideoStream);
    } catch (error) {
      console.log(error);
      handleGetUserMediaError(error);
    } finally {
      setIsFlipping(false);
    }
  };

  return (
    <>
      <div>
        <header className="w-full h-[62px] justify-center items-center bg-black text-blue-200 hidden lg:flex sticky top-0 z-50">
          <nav>WELCOME TO KICK</nav>
        </header>
        {/* MAIN COMP */}
        <main className="min-h-svh w-full h-fit lg:min-h-0 lg:h-[calc(100vh-62px)] lg:w-full bg-red-600 lg:overflow-hidden">
          <div className="flex flex-col items-start w-full gap-4 lg:grid lg:gap-4 lg:relative lg:py-4 lg:px-4 lg:min-h-0 lg:h-full lg:w-full lg:[grid-template-areas:'shop_player_sidebar'] lg:grid-cols-[minmax(230px,1fr)_minmax(500px,2fr)_minmax(250px,1fr)]">
            {/* streamer section - centered one */}
            <div className="flex min-w-0 min-h-0 w-full h-full flex-col gap-2 [grid-area:player]">
              <section className="relative w-full lg:min-h-0 h-svh lg:h-full lg:rounded-2xl overflow-hidden bg-neutral-900 aspect-9/16">
                {/* render a canvas element to have janky UI */}
                <div className="flex aspect-9/16 size-full flex-col">
                  <div
                    className="w-full flex-1"
                    style={{
                      width: "100%",
                      height: "100%",
                      overflow: "hidden",
                      backgroundColor: "rgb(0,0,0)",
                    }}
                  >
                    <div className="w-full h-full">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={cn(
                          "h-full w-full object-cover sm:object-contain",
                          shouldMirror ? "scale-x-[-1]" : "",
                        )}
                      />
                      {/* error overlay layout */}
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

                      {/* master overlay */}
                      <div className="absolute inset-0 flex flex-col pointer-events-none">
                        {/* ---- RIGHT ICON RAIL ---- */}
                        <div className="absolute right-4 top-4 flex flex-col gap-4 pointer-events-auto">
                          {isMobile && (
                            <button
                              onClick={handleToggleCamera}
                              className="cursor-pointer bg-black/50 flex items-center justify-center text-white pointer-events-auto px-3 py-1 rounded-2xl"
                            >
                              {isFlipping ? "Flipping.." : "Flip Camera"}
                            </button>
                          )}
                        </div>

                        {/* ---- BOTTOM STACK ---- */}
                        <div className="flex flex-col justify-center items-center gap-2 p-3 absolute inset-x-0 bottom-0 pointer-events-auto">
                          <Button
                            disabled={loading}
                            onClick={handleGoLiveClick}
                            className="w-full max-w-[150px] py-4 rounded-xl bg-blue-400 text-zinc-950 font-bold disabled:opacity-50 shrink-0 cursor-pointer hover:bg-blue-400/65 text-[16px]"
                            type="button"
                          >
                            Go Live
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
            {/* shop area - first column */}
            <div className="flex flex-col min-w-0 w-full min-h-0 h-full lg:min-h-0 lg:h-full overflow-auto [grid-area:shop] bg-green-500">
              shp/product area
            </div>
            {/* chat area - third cloumn */}
            <div className="hidden lg:flex flex-col min-w-0 w-full min-h-0 h-full lg:min-h-0 lg:h-full overflow-auto [grid-area:sidebar] bg-amber-400">
              Chat box
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
