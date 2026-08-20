import { Button } from "@/components/ui/button";

import { useState } from "react";

export const SellerView = ({ roomId }: { roomId: string }) => {
  console.log("roomId : ", roomId);

  const [token, setToken] = useState<string | null>(null);

  const handleGoLive = async () => {
    const res = await fetch(`/api/livekit/token?room=${roomId}&role=seller`);
  };

  return (
    <>
      <div className="w-full h-screen">
        <Button onClick={handleGoLive}>go live</Button>
      </div>
    </>
  );
};
