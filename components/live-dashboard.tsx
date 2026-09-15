"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
  useParticipants,
  useLocalParticipant,
  useTracks,
  VideoTrack,
  isTrackReference,
  TrackToggle,
} from "@livekit/components-react";

import "@livekit/components-styles";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Gift,
  ShareIcon,
  Star,
  VideoIcon,
  VideoOffIcon,
  Volume2,
  VolumeX,
  WalletIcon,
} from "lucide-react";
import { Button } from "./ui/button";
import Image from "next/image";
import { Track } from "livekit-client";
import { cn } from "@/lib/utils";

type SavedDevice = { showId: string; deviceId: string };

interface ChatMessage {
  id: string;
  text: string;
  user: string;
}

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
          toast.error(
            "Selected Cam and Mic not found, Falling back to default devices",
          );

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

        <SellerStreamView />
        <RoomAudioRenderer />
        {/* <RoomAudioRenderer> is solely responsible for playing the audio of other people in the room. */}
        {/* ever plan to allow "co-hosts" to join the stream, or want to let a buyer join with their microphone to ask a question, the seller will not be able to hear them unless <RoomAudioRenderer> is there. */}
      </LiveKitRoom>
    </div>
  );
}

function SellerStreamView() {
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
  const participants = useParticipants();
  const { localParticipant, isCameraEnabled, isMicrophoneEnabled } =
    useLocalParticipant();

  // Get seller's local camera track reference
  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: true },
  ]);
  const localCameraTrackRef = tracks.find(
    (trackRef) => trackRef.participant.identity === localParticipant.identity,
  );

  const localCameraTrack =
    localCameraTrackRef && isTrackReference(localCameraTrackRef)
      ? localCameraTrackRef
      : undefined;

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
                      {localCameraTrack && isCameraEnabled ? (
                        <VideoTrack
                          trackRef={localCameraTrack}
                          className={cn(
                            "h-full w-full object-cover sm:object-contain!",
                            shouldMirror ? "scale-x-[-1]" : "",
                          )}
                        />
                      ) : (
                        <div className="w-full h-full bg-black flex justify-center items-center">
                          <p className="text-[16px] text-blue-200">
                            Camera is switched off
                          </p>
                        </div>
                      )}

                      {/* actual overlay component */}
                      {/* 1. scrim layer at top and bottom - gradient bg for visible text : DIVS are self closing */}
                      {/* <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent z-10 pointer-events-none" />
                        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/70 to-transparent z-10 pointer-events-none" /> */}
                      {/* ---------------------------- */}
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
                              {participants.length}
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
                            onClick={() =>
                              localParticipant.setCameraEnabled(
                                !isCameraEnabled,
                              )
                            }
                            className="size-9 cursor-pointer rounded-full bg-black/50 flex items-center justify-center text-white pointer-events-auto"
                          >
                            {isCameraEnabled ? (
                              <VideoIcon className="size-5" />
                            ) : (
                              <VideoOffIcon className="size-5" />
                            )}
                          </button>
                          <button
                            onClick={() =>
                              localParticipant.setMicrophoneEnabled(
                                !isMicrophoneEnabled,
                              )
                            }
                            className="size-9 cursor-pointer rounded-full bg-black/50 flex items-center justify-center text-white pointer-events-auto"
                          >
                            {isMicrophoneEnabled ? (
                              <Volume2 className="size-5" />
                            ) : (
                              <VolumeX className="size-5" />
                            )}
                          </button>
                          <button
                            onClick={() => console.log("share")}
                            className="size-9 cursor-pointer rounded-full bg-black/50 flex items-center justify-center text-white pointer-events-auto"
                          >
                            <ShareIcon className="size-5" />
                          </button>
                        </div>

                        {/* ---- BOTTOM STACK ---- */}
                        <div className="flex flex-col gap-2 p-3 absolute inset-x-0 bottom-0">
                          {/* chat feed — overlay only on mobile */}

                          <div
                            id="chat-box"
                            className="pointer-events-auto flex flex-col gap-4 max-h-[40vh] max-w-8/12 overflow-y-auto px-4 pb-2 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] lg:hidden"
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
                          <div className="px-4 py-2 w-full lg:hidden pointer-events-auto">
                            <input
                              placeholder="Say something..."
                              onChange={(e) => console.log(e.target.value)}
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
                          <div className="flex gap-2 pointer-events-auto">
                            <button
                              onClick={() => console.log("custom btn")}
                              className="flex-1 rounded-full bg-white/10 text-white text-sm font-semibold py-2"
                            >
                              Custom
                            </button>
                            <button
                              onClick={() => console.log("bid btn")}
                              className="flex-[2] rounded-full bg-yellow-400 text-black text-sm font-bold py-2"
                            >
                              Bid: ${101}
                            </button>
                          </div>
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
