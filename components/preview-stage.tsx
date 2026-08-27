"use client";

import { Button } from "./ui/button";

const STATE = {
  IDLE: "idle",
  REQUESTING: "requesting",
  DENIED: "denied",
  NO_DEVICE: "no_device",
  READY: "ready",
  ERROR: "error",
} as const;

const videoDevices = [1, 2, 4, 5, 6];

const audioDevices = [1, 2, 3, 4, 5, 7];

type PermissionState = (typeof STATE)[keyof typeof STATE];

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

export default function PreviewStage({
  showId,
  isMobile,
  liveShowStatus,
}: {
  showId: string;
  liveShowStatus: "LIVE" | "SCHEDULED";
  isMobile: boolean;
}) {
  return (
    <>
      <div className="w-full max-w-2xl mx-auto text-zinc-100 p-4">
        <div className="relative aspect-video w-full h-[80vh] overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800 shadow-lg">
          <video
            // ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
          />

          {/* {permissionState === STATE.REQUESTING && (
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
          )} */}
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
            <select className="rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
              {videoDevices.map((d) => (
                <option key={d} value={d}>
                  {d || `Camera ${d}`}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-300">
            Microphone
            <select
              // value={selectedAudioId}
              // onChange={onSelectAudio}
              className="rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {audioDevices.map((d) => (
                <option key={d} value={d}>
                  {d || `Mic ${d}`}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </>
  );
}
