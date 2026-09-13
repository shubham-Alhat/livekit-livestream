"use client";
import { Bell, Gift, Heart, MessageCircle, Search } from "lucide-react";
import { useRouter } from "next/navigation";

function Logo() {
  return (
    <div className="flex items-center gap-2 text-xl font-black tracking-tight">
      <span className="grid size-9 place-items-center rounded-xl bg-[#ebe5e5] text-lg text-black">
        w
      </span>
      <span className="hidden lg:flex text-black">whatnot</span>
    </div>
  );
}

export const Navbar = () => {
  const router = useRouter();

  return (
    <>
      <header className="h-16 flex justify-between items-center border-b bg-blue-400 px-6">
        <Logo />

        <div className="flex items-center gap-6 text-black">
          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-full bg-neutral-100 px-4 py-3 text-sm font-bold cursor-pointer bg-white"
          >
            Dashboard
          </button>
          <Heart className="lg:inline-block hidden" size={21} />
          <MessageCircle className="lg:inline-block hidden" size={21} />
          <Bell className="lg:inline-block hidden" size={21} />
          <Gift className="lg:inline-block hidden" size={21} />
          <span className="grid size-10 place-items-center rounded-full bg-neutral-200 text-sm font-bold">
            S
          </span>
        </div>
      </header>
    </>
  );
};
