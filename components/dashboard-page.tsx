"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import DateTimePicker from "./date-time-picker";

export default function DashboardPage() {
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
  const router = useRouter();

  const [startsAt, setStartsAt] = useState<Date | null>(null);

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

      router.push(`/dashboard/live/${data.streamId}`);
    } catch (error) {
      console.error(error);
      toast.error("Network error, please try again");
    } finally {
      setLoading(false);
    }
  };

  // for debugging purpose
  useEffect(() => {
    console.log(
      `${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} :: startsAt = ${startsAt}`,
    );
  }, [startsAt]);

  return (
    <>
      <div className="w-full h-screen flex justify-center items-center">
        <div className="w-[300px]">
          <DateTimePicker value={startsAt} onChange={setStartsAt} />
        </div>
      </div>
    </>
  );
}
