"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function DashboardPage() {
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
  const router = useRouter();

  const handleCreateStream = async () => {
    if (description.trim() === "") {
      alert("Need description to start stream!");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/create/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ streamDescription: description }),
      });

      const data = await res.json();

      console.log(data);

      if (data.redirectToLogin) {
        toast.error("session expired!");
        router.push("/login");
        return;
      }

      if (!res.ok || !data.success) {
        toast.error(data.message ?? "Something went wrong");
        return;
      }

      router.push(`/dashboard/preview/${data.streamId}`);
    } catch (error) {
      console.error(error);
      toast.error("Network error, please try again");
    } finally {
      setLoading(false);
    }
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
            disabled={loading}
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
