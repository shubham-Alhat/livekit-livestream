"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Overlay, STATE, PermissionState } from "./overlay";
import { Gift, ShareIcon, Star, WalletIcon } from "lucide-react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Volume2 } from "lucide-react";
import { VolumeX } from "lucide-react";

interface ChatMessage {
  id: string;
  text: string;
  user: string;
}

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

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "01", text: "Hello world by whatnot", user: "Whatnot_user" },
    { id: "02", text: "This item looks amazing!", user: "collector_23" },
    { id: "03", text: "Is shipping included?", user: "buyer_mike" },
    { id: "04", text: "Placing my bid now 🔥", user: "Whatnot_user" },
    { id: "05", text: "How many left in stock?", user: "sarah_j" },
    { id: "06", text: "First time here, loving the vibe", user: "newbie99" },
    { id: "07", text: "Can you show the back side?", user: "collector_23" },
    { id: "08", text: "That price is a steal", user: "deal_hunter" },
    { id: "09", text: "GG well played everyone", user: "buyer_mike" },
    { id: "10", text: "Adding to cart right away", user: "sarah_j" },
    { id: "11", text: "Does this ship internationally?", user: "eu_buyer_88" },
    { id: "12", text: "Loving this stream today", user: "Whatnot_user" },
    { id: "13", text: "Next item please!", user: "newbie99" },
    { id: "14", text: "Condition looks mint", user: "collector_23" },
    { id: "15", text: "Thanks for the great deal 🙌", user: "deal_hunter" },
  ]);

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
        <header className="w-full h-[62px] justify-center items-center bg-black text-blue-200 hidden lg:flex">
          <nav>WELCOME TO KICK</nav>
        </header>

        {/* MAIN COMP */}

        <main className="min-h-screen lg:min-h-0 lg:h-[calc(100vh-62px)] bg-blue-700">
          <div className="bg-neutral-25 px-4 pb-4">
            <div className="block lg:grid gap-4 fixed lg:relative inset-0 lg:py-4 overflow-y-scroll lg:overflow-y-auto h-screen lg:h-[calc(100vh-62px)] lg:min-h-0 items-start mb-4 grid-rows-1 [grid-template-areas:'shop_player_sidebar'] grid-cols-[minmax(230px,1fr)_minmax(500px,2fr)_minmax(250px,1fr)]">
              {/* streamer section - centered one */}

              <div className="flex min-w-0 size-full flex-col gap-2 [grid-area:player]">
                <section className="relative w-full h-full min-h-0 max-h-screen lg:max-h-[calc(100vh-62px)] lg:rounded-2xl overflow-hidden bg-neutral-900 aspect-9/16">
                  {/* render a canvas element to have janky UI */}

                  <div className="flex size-full flex-col">
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
                            paddingBottom: "24px",
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

                          {/* 1. scrim layer at top and bottom - gradient bg for visible text */}
                          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent z-10 pointer-events-none" />
                          <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/70 to-transparent z-10 pointer-events-none" />
                          {/* ---------------------------- */}
                          {/* master overlay */}
                          <div className="absolute inset-0 z-20 flex flex-col justify-between pointer-events-none">
                            {/* ---- TOP BAR ---- */}
                            <div className="flex items-start justify-between p-4 pointer-events-auto">
                              {/* seller info - top left */}
                              <div className="flex items-center gap-3">
                                <Avatar className="size-12 border border-white/20">
                                  <AvatarImage
                                    src="https://res.cloudinary.com/diery17cm/image/upload/v1779881922/apfvnjmurhd7hsogeusm.jpg"
                                    alt="bottledbeauty"
                                  />
                                  <AvatarFallback>BB</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col gap-1">
                                  <span className="text-white text-[15px] font-semibold">
                                    bottledbeauty
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="flex items-center gap-1 text-sm font-medium">
                                      <Star className="size-3 fill-yellow-400" />{" "}
                                      4.8
                                    </span>
                                    <Button
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
                            <div className="absolute right-2 top-1/3 flex flex-col gap-4 pointer-events-auto">
                              <button
                                onClick={toggleMute}
                                className="size-9 cursor-pointer rounded-full bg-black/50 flex items-center justify-center text-white"
                              >
                                {isMute ? (
                                  <VolumeX className="size-5" />
                                ) : (
                                  <Volume2 className="size-5" />
                                )}
                              </button>
                              <button className="size-9 cursor-pointer rounded-full bg-black/50 flex items-center justify-center text-white">
                                <ShareIcon className="size-5" />
                              </button>
                              <button className="size-9 cursor-pointer rounded-full bg-black/50 flex items-center justify-center text-white">
                                <WalletIcon className="size-5" />
                              </button>
                            </div>

                            {/* ---- BOTTOM STACK ---- */}
                            <div className="flex flex-col gap-2 p-3 pointer-events-auto">
                              {/* chat feed — overlay only on mobile */}

                              <div
                                id="chat-box"
                                className="flex flex-col gap-4 max-h-[40vh] overflow-y-auto px-4 pb-2 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] lg:hidden"
                              >
                                {messages.map((msg) => (
                                  <div
                                    key={msg.id}
                                    className="flex flex-row items-start gap-2 w-full max-w-full"
                                  >
                                    {/* Avatar Circle */}
                                    <div className="w-7 h-7 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-black text-xs font-bold mt-0.5">
                                      {msg.user.charAt(0).toUpperCase()}
                                    </div>

                                    {/* Username and Message Container */}
                                    <div className="flex flex-col leading-tight min-w-0 flex-1">
                                      {/* Username */}
                                      <span className="text-white font-bold text-sm drop-shadow-md truncate">
                                        {msg.user}
                                      </span>

                                      {/* Actual Message */}
                                      <span className="text-orange-500 text-sm font-medium drop-shadow-md block truncate w-full">
                                        {msg.text}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* say something input — mobile only */}
                              <div className="px-4 py-2 w-full lg:hidden">
                                <input
                                  placeholder="Say something..."
                                  className="w-full rounded-full bg-transparent border border-white text-white text-sm px-4 py-2 placeholder:text-white/80 focus:outline-none focus:ring-1 focus:ring-white drop-shadow-md"
                                />
                              </div>

                              {/* product card */}

                              <div className="flex items-center justify-between gap-3 bg-black/50 rounded-xl p-2.5">
                                {/* Left Section: Image + Text */}
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                  {/* Image Thumbnail */}
                                  <div className="relative shrink-0 size-14 overflow-hidden rounded-lg border border-white/30">
                                    <Image
                                      src="https://res.cloudinary.com/diery17cm/image/upload/v1779897446/tknlm9ocydjm3wpqofqa.jpg"
                                      alt="Raymond watch"
                                      width={56}
                                      height={56}
                                      className="size-full object-cover"
                                      loading="lazy"
                                    />
                                  </div>

                                  {/* Details (Stacked Vertically) */}
                                  <div className="flex flex-col min-w-0 flex-1">
                                    <p className="text-white text-[15px] font-bold truncate leading-tight">
                                      Raymond watch
                                    </p>
                                    <p className="text-white text-sm truncate leading-tight mt-0.5">
                                      this is tom cruise's watch
                                    </p>
                                    <p className="text-white text-[13px] leading-tight mt-1">
                                      10 Bids
                                    </p>
                                    <p className="text-white/60 text-xs leading-tight mt-1">
                                      Shipping + Taxes are extra
                                    </p>
                                  </div>
                                </div>

                                {/* Right Section: Price + Timer/Status */}
                                <div className="flex flex-col items-end shrink-0 p-1.5">
                                  <span className="text-white font-bold text-base leading-tight">
                                    $29
                                  </span>
                                  <span className="text-red-500 font-semibold text-sm leading-tight mt-1">
                                    💀 00:09
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
