"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Overlay, STATE, PermissionState } from "./overlay";
import { ShareIcon, WalletIcon } from "lucide-react";

const messages = [
  { id: 1, user: "Alice", text: "This is such a great stream! 🔥" },
  { id: 2, user: "Bob_99", text: "How much is the current bid?" },
  { id: 3, user: "SarahK", text: "Just placed my bid 💰" },
  { id: 4, user: "MikeT", text: "lol that's a steal at this price" },
  { id: 5, user: "Priya_", text: "Can you zoom in on the item?" },
  { id: 6, user: "JohnDoe", text: "Following for more auctions like this" },
  { id: 7, user: "Alice", text: "Worth every penny 😍" },
  { id: 8, user: "RaviK", text: "Shipping to India available?" },
  { id: 9, user: "Emma_W", text: "🔥🔥🔥" },
  { id: 11, user: "Bob_99", text: "Outbid! going again 😤" },
  { id: 12, user: "Bob_99", text: "Outbid! going again 😤" },
  { id: 13, user: "Bob_99", text: "Outbid! going again 😤" },
  { id: 14, user: "Bob_99", text: "Outbid! going again 😤" },
  { id: 15, user: "Bob_99", text: "Outbid! going again 😤" },
  { id: 16, user: "Bob_99", text: "Outbid! going again 😤" },
  { id: 17, user: "Bob_99", text: "Outbid! going again 😤" },
  { id: 18, user: "Bob_99", text: "Outbid! going again 😤" },
  { id: Date.now(), user: "Bob788s", text: "Outbid! going again 😤" },
  { id: Date.now(), user: "shubhma", text: "Outbid! going again 😤" },
  { id: Date.now(), user: "alexnnh", text: "Outbid! going again 😤" },
  { id: Date.now(), user: "7543-jks", text: "Outbid! going again " },
  { id: Date.now(), user: "jenny", text: "Outbid! going again " },
  { id: Date.now(), user: "90", text: "Outbid! going again 😤" },
  { id: Date.now(), user: "Bob_99", text: "Outbid! going again 😤" },
];

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
        <header className="w-full h-[62px] flex justify-center items-center bg-black text-blue-200 hidden lg:flex sticky top-0 z-50">
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
                  <div className="flex aspect-9/16 size-full flex-col">
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
                            src={
                              "https://res.cloudinary.com/diery17cm/video/upload/v1788695664/tom-cruise_seltqi.mp4"
                            }
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="h-full w-full object-cover sm:object-contain"
                          />

                          {/* actual overlay component */}
                          {/* 1. scrim layer at top and bottom - gradient bg for visible text : DIVS are self closing */}
                          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent z-10 pointer-events-none" />
                          <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/70 to-transparent z-10 pointer-events-none" />
                          {/* ---------------------------- */}
                          {/* master overlay */}
                          <div className="absolute inset-0 z-20 flex flex-col justify-between pointer-events-none">
                            {/* ---- TOP BAR ---- */}
                            <div className="flex items-start justify-between p-3 pointer-events-auto">
                              {/* seller info - top left */}
                              <div className="flex items-center gap-2">
                                <img
                                  src={
                                    "https://res.cloudinary.com/diery17cm/image/upload/v1779881922/apfvnjmurhd7hsogeusm.jpg"
                                  }
                                  alt={"Tom Cruise"}
                                  className="size-9 rounded-full border border-white/20"
                                />
                                <div className="flex flex-col leading-tight">
                                  <span className="text-white text-sm font-semibold">
                                    {"Tom Cruise"}
                                  </span>
                                  <span className="flex items-center gap-1 text-yellow-400 text-xs">
                                    ★ {4.5}
                                  </span>
                                </div>
                              </div>

                              {/* viewer count + giveaway - top right */}
                              <div className="flex flex-col items-end gap-2">
                                <div className="flex items-center gap-1 bg-red-600 rounded-full px-2 py-1 text-white text-xs font-semibold">
                                  <span className="size-1.5 rounded-full bg-white animate-pulse" />
                                  {11}
                                </div>
                                {true && (
                                  <div className="flex flex-col items-center bg-black/70 rounded-xl px-3 py-2 text-white text-xs">
                                    <span>🎁</span>
                                    <span>{34} Entries</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* ---- RIGHT ICON RAIL ---- */}
                            <div className="absolute right-2 top-1/3 flex flex-col gap-4 pointer-events-auto">
                              <button className="size-9 rounded-full bg-black/50 flex items-center justify-center text-white">
                                <ShareIcon className="size-5" />
                              </button>
                              <button className="size-9 rounded-full bg-black/50 flex items-center justify-center text-white">
                                <WalletIcon className="size-5" />
                              </button>
                            </div>

                            {/* ---- BOTTOM STACK ---- */}
                            <div className="flex flex-col gap-2 p-3 pointer-events-auto">
                              {/* chat feed — overlay only on mobile */}
                              <div
                                id="chat-box"
                                className="flex flex-col gap-1 max-h-[30vh] overflow-y-auto lg:hidden"
                              >
                                {messages.map((msg) => (
                                  <div
                                    key={msg.id}
                                    className="break-words whitespace-pre-wrap max-w-[80%] text-white text-sm bg-black/40 rounded-md px-2 py-1"
                                  >
                                    <span className="font-semibold">
                                      {msg.user}:{" "}
                                    </span>
                                    {msg.text}
                                  </div>
                                ))}
                              </div>

                              {/* say something input — mobile only, desktop version lives in sidebar */}
                              <input
                                placeholder="Say something..."
                                className="lg:hidden w-full rounded-full bg-black/40 border border-white/20 text-white text-sm px-4 py-2 placeholder:text-white/50"
                              />

                              {/* product card */}
                              <div className="flex items-center gap-3 bg-black/60 rounded-lg p-2">
                                <img
                                  src={
                                    "https://res.cloudinary.com/diery17cm/image/upload/v1779897446/tknlm9ocydjm3wpqofqa.jpg"
                                  }
                                  alt={"My Watch"}
                                  className="size-12 rounded-md object-cover"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-white text-sm font-semibold truncate">
                                    {"Raymond watch"}
                                  </p>
                                  <p className="text-white/60 text-xs truncate">
                                    {"this is tom cruise's watch"}
                                  </p>
                                  <p className="text-white/60 text-xs">
                                    {10} Bids
                                  </p>
                                </div>
                                <div className="flex flex-col items-end text-white text-sm">
                                  <span className="font-bold">${29}</span>
                                  <span className="text-red-400 text-xs">
                                    {67}
                                  </span>
                                </div>
                              </div>

                              {/* bid buttons */}
                              <div className="flex gap-2">
                                <button className="flex-1 rounded-full bg-white/10 text-white text-sm font-semibold py-2">
                                  Custom
                                </button>
                                <button className="flex-[2] rounded-full bg-yellow-400 text-black text-sm font-bold py-2">
                                  Bid: ${101}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
              {/* shop area - first column */}
              <div className="flex flex-col h-full min-h-0 [grid-area:shop] bg-green-500">
                shp/product area
              </div>
              {/* chat area - third cloumn */}
              <div className="hidden lg:flex flex-col gap-4 min-h-0 h-full [grid-area:sidebar] bg-amber-400">
                Chat box
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
