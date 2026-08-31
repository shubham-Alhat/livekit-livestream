"use client";

export const STATE = {
  IDLE: "idle",
  REQUESTING: "requesting",
  DENIED: "denied",
  NO_DEVICE: "no_device",
  READY: "ready",
  ERROR: "error",
} as const;

export type PermissionState = (typeof STATE)[keyof typeof STATE];

export interface StreamOptions {
  videoId?: string;
  audioId?: string;
  facing?: string;
  relaxed?: boolean;
}

export function Overlay({
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
