"use client";

import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import React, { useState } from "react";

function Livepage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const decodedId = decodeURIComponent(id);

  const searchParams = useSearchParams();
  const query = searchParams.get("userId");

  const handleSubmit = () => {};

  return (
    <>
      <div className="h-screen w-full">
        <Button onClick={handleSubmit} className="cursor-pointer">
          start stream
        </Button>
      </div>
    </>
  );
}

export default Livepage;
