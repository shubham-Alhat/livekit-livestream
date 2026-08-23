"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export default function DashboardPage() {
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");

  const handleCreateStream = async () => {
    if (description.trim() === "") {
      alert("Need description to start stream!");
      return;
    }

    const res = await fetch("/api/create/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ streamDescription: description }),
    });

    console.log(await res.json());
  };

  return (
    <>
      <div className="w-full h-screen flex justify-center items-center">
        <div className="w-[300px]">
          <Input
            type="text"
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter text"
          />
          <p className="text-sm mt-0.5">Give your auction description</p>
          <Button
            onClick={handleCreateStream}
            className="cursor-pointer mt-1.5"
          >
            Create stream
          </Button>
        </div>
      </div>
    </>
  );
}
