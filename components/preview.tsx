"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Overlay, STATE, PermissionState } from "./overlay";
import { Gift, ShareIcon, Star, SwitchCamera, WalletIcon } from "lucide-react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Volume2 } from "lucide-react";
import { VolumeX } from "lucide-react";

interface ChatMessage {
  id: string;
  text: string;
  user: string;
}

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
  const [isFlipping, setIsFlipping] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [loading, setLoading] = useState(false);

  const [isMute, setIsMute] = useState(true);

  // toggleMute
  const toggleMute = () => {
    setIsMute((prev) => !prev);
  };

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

        const videoTrack = initialStream.getVideoTracks()[0];
        const { width, height } = videoTrack.getSettings();

        console.log("width:", width);
        console.log("height:", height);

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

    // await onGoLive();
    setLoading(false);
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
                        className="h-full w-full object-cover sm:object-contain"
                      />

                      {/* master overlay */}
                      <div className="absolute inset-0 flex flex-col pointer-events-none">
                        {/* ---- TOP BAR ---- */}
                        <div className="absolute top-0 inset-x-0 flex items-start justify-between p-4">
                          {/* seller info - top left */}
                          <div className="flex items-center gap-3 pointer-events-auto">
                            <Avatar
                              onClick={() => console.log("Avatar")}
                              className="size-12 border border-white/20"
                            >
                              <AvatarImage
                                src="https://res.cloudinary.com/diery17cm/image/upload/v1779881922/apfvnjmurhd7hsogeusm.jpg"
                                alt="bottledbeauty"
                              />
                              <AvatarFallback>BB</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col gap-1">
                              <span
                                onClick={() => console.log("username:seller")}
                                className="text-white text-[15px] font-semibold"
                              >
                                bottledbeauty
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="flex items-center gap-1 text-sm font-medium">
                                  <Star className="size-3 fill-yellow-400" />{" "}
                                  4.8
                                </span>
                                <Button
                                  onClick={() => console.log("follow btn")}
                                  size="sm"
                                  className="h-6 rounded-full bg-yellow-400 hover:bg-yellow-500 text-black text-xs font-semibold px-3"
                                >
                                  Follow
                                </Button>
                              </div>
                            </div>
                          </div>

                          {/* viewer count + giveaway - top right */}
                          <div className="flex flex-col items-end gap-4">
                            <div className="flex items-center gap-1 bg-red-600 rounded-full px-2 py-1 text-white text-sm animate-pulse font-semibold">
                              <span className="size-1.5 rounded-full bg-white animate-pulse" />
                              {/* <Users size={16} className="animate-pulse" /> */}
                              {11}
                            </div>
                            {true && (
                              <div className="relative overflow-hidden w-fit rounded-2xl bg-black/50 px-4 py-3 text-white shadow-lg">
                                <div
                                  className="shine-sweep pointer-events-none absolute inset-0 w-1/2 h-[300%] -top-[100%]"
                                  style={{
                                    background:
                                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
                                  }}
                                />

                                <p className="text-sm font-semibold mb-2">
                                  Giveaway
                                </p>
                                <div className="flex items-center gap-2">
                                  <div className="relative">
                                    <Gift
                                      className="size-5 text-white"
                                      strokeWidth={1.75}
                                    />
                                    {/* sparkle marks */}
                                    <span className="absolute -top-1 -left-1 h-1 w-1 rounded-full bg-white/70" />
                                    <span className="absolute -top-1.5 left-2 h-[3px] w-[3px] rounded-full bg-white/70" />
                                  </div>
                                  <div className="flex flex-col leading-tight">
                                    <span className="text-base font-bold">
                                      {32}
                                    </span>
                                    <span className="text-[11px] text-white/60 -mt-0.5">
                                      Entries
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* ---- RIGHT ICON RAIL ---- */}
                        <div className="absolute right-3 top-1/3 flex flex-col gap-4 pointer-events-auto">
                          <button
                            onClick={toggleMute}
                            className="size-9 cursor-pointer rounded-full bg-black/50 flex items-center justify-center text-white pointer-events-auto"
                          >
                            {isMute ? (
                              <VolumeX className="size-5" />
                            ) : (
                              <Volume2 className="size-5" />
                            )}
                          </button>
                          <button
                            onClick={() => console.log("share")}
                            className="size-9 cursor-pointer rounded-full bg-black/50 flex items-center justify-center text-white pointer-events-auto"
                          >
                            <SwitchCamera className="size-5" />
                          </button>
                        </div>

                        {/* ---- BOTTOM STACK ---- */}
                        <div className="flex flex-col justify-center items-center gap-2 p-3 absolute inset-x-0 bottom-0 pointer-events-auto">
                          {!isMobile && (
                            <div className="w-full max-w-sm grid grid-cols-2 gap-3 text-left bg-black p-3 rounded-xl border border-zinc-800/80 shrink-0">
                              <label className="flex flex-col gap-1 text-xs font-medium text-zinc-400">
                                Camera
                                <select
                                  onChange={onSelectVideo}
                                  value={selectedVideoId}
                                  className="rounded-lg bg-zinc-900 border border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  {videoDevices.map((d) => (
                                    <option key={d.deviceId} value={d.deviceId}>
                                      {d.label ||
                                        `Camera ${d.deviceId.slice(0, 6)}`}
                                    </option>
                                  ))}
                                </select>
                              </label>

                              <label className="flex flex-col gap-1 text-xs font-medium text-zinc-400">
                                Microphone
                                <select
                                  value={selectedAudioId}
                                  onChange={onSelectAudio}
                                  className="rounded-lg bg-zinc-900 border border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  {audioDevices.map((d) => (
                                    <option key={d.deviceId} value={d.deviceId}>
                                      {d.label ||
                                        `Mic ${d.deviceId.slice(0, 6)}`}
                                    </option>
                                  ))}
                                </select>
                              </label>
                            </div>
                          )}
                          <Button
                            disabled={loading}
                            onClick={handleGoLiveClick}
                            className="w-full max-w-sm py-2.5 rounded-xl bg-yellow-500 text-zinc-950 font-bold hover:bg-yellow-400 transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
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
