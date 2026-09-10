"use client";
import { Bell, Gift, Heart, MessageCircle, Search } from "lucide-react";

function Logo() {
  return (
    <div className="flex items-center gap-2 text-xl font-black tracking-tight">
      <span className="grid size-9 place-items-center rounded-xl bg-[#171717] text-lg text-white">
        w
      </span>
      <span>whatnot</span>
    </div>
  );
}

export const Navbar = () => {
  return (
    <>
      <header className="hidden h-16 items-center border-b bg-white px-8 lg:flex">
        <Logo />
        <nav className="ml-24 flex gap-10 text-sm text-black font-semibold">
          <a href="#home">Home</a>
          <a href="#browse">Browse</a>
        </nav>
        <div className="mx-auto flex h-12 w-full max-w-md items-center gap-3 rounded-full border px-5 text-sm text-black text-neutral-500">
          <Search size={20} />
          <span>Search Whatnot</span>
        </div>
        <div className="flex items-center gap-6 text-black">
          <button className="rounded-full bg-neutral-100 px-5 py-3 text-sm font-bold">
            Become a Seller
          </button>
          <Heart size={21} />
          <MessageCircle size={21} />
          <Bell size={21} />
          <Gift size={21} />
          <span className="grid size-10 place-items-center rounded-full bg-neutral-200 text-sm font-bold">
            S
          </span>
        </div>
      </header>
    </>
  );
};
