"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Overlay, STATE, PermissionState } from "./overlay";

import { PreJoin } from "@livekit/components-react";
import "@livekit/components-styles";

export default function Preview({
  showId,
  isMobile,
  onGoLive,
}: {
  showId: string;
  isMobile: boolean;
  onGoLive: () => Promise<void>;
}) {
  // const handleGoLiveClick = async () => {
  //   setLoading(true);
  //   if (streamRef.current) {
  //     streamRef.current.getTracks().forEach((track) => track.stop());
  //     streamRef.current = null;
  //   }

  //   await onGoLive();
  //   setLoading(false);
  // };

  // const handleToggleCamera = async () => {
  //   if (!streamRef.current) return;

  //   setIsFlipping(true);

  //   stopStream(streamRef.current);
  //   const newFacingMode = facingMode === "user" ? "environment" : "user";

  //   setFacingMode(newFacingMode);

  //   try {
  //     const newVideoStream = await navigator.mediaDevices.getUserMedia({
  //       video: { facingMode: { exact: newFacingMode } },
  //       audio: true,
  //     });

  //     attachStream(newVideoStream);
  //     setIsFlipping(false);
  //   } catch (error) {
  //     console.log(error);
  //     setErrorMessage("Failed to flip camera");
  //     setPermissionState(STATE.ERROR);
  //   }
  // };

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

                <PreJoin className="preview-stage" />
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
