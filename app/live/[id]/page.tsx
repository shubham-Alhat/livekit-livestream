"use client";

import { Button } from "@/components/ui/button";
import { SellerView } from "@/utils/seller-stream";
import { BuyerViewr } from "@/utils/viewer-stream";
import { useSearchParams } from "next/navigation";
import React, { useState } from "react";

function Livepage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const decodedId = decodeURIComponent(id);
  console.log("id : ", decodedId);

  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const role = searchParams.get("role");

  console.log("userId : ", userId);
  console.log("Role : ", role);

  const handleSubmit = () => {};

  if (role === "buyer" && userId) {
    return <BuyerViewr roomId={userId} />;
  }

  if (role === "seller" && userId) {
    return <SellerView roomId={userId} />;
  }
}

export default Livepage;
