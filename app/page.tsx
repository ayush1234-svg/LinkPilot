"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const [text, setText] = useState("");
  const router = useRouter();

  const handleClaim = () => {
    const handle = text.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    if (handle) {
      router.push(`/generate?handle=${encodeURIComponent(handle)}`);
    } else {
      router.push("/generate");
    }
  };

  return (
    <main>
      <section className="bg-[#254f1a] min-h-screen flex flex-col lg:grid lg:grid-cols-2">
        {/* Text content */}
        <div className="flex flex-col justify-center px-6 pt-16 pb-10 sm:px-12 sm:pt-20 lg:ml-10 lg:py-0 xl:ml-20">
          <h1 className="text-yellow-300 font-extrabold text-[2.5rem] leading-[0.92] tracking-[-0.04em] sm:text-5xl lg:text-6xl lg:leading-[1.05]">
            Everything you are.<br />In one, simple<br />link in bio.
          </h1>

          <p className="text-yellow-200 my-5 max-w-lg text-[0.88rem] leading-relaxed sm:text-base lg:text-lg">
            Your links. Your brand. One place. LinkPilot lets you share all
            your important links — socials, projects, content, and more —
            through a single, beautiful profile.
          </p>

          <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">@</span>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleClaim()}
                className="w-full pl-9 pr-4 py-3.5 bg-gray-100 hover:bg-white focus:bg-white text-gray-900 rounded-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 transition text-sm sm:text-base shadow-sm"
                placeholder="yourhandle"
              />
            </div>
            <button
              onClick={handleClaim}
              className="w-full rounded-full bg-pink-300 px-6 py-3.5 text-sm font-bold text-gray-950 shadow-md transition hover:bg-pink-400 active:scale-[0.98] sm:w-auto sm:whitespace-nowrap sm:text-base"
            >
              Claim Your Links
            </button>
          </div>

          {/* Quick hint for mobile users */}
          <p className="text-xs text-yellow-200/80 mt-3 flex items-center gap-1.5">
            <span>✨ Already created?</span>
            <Link href="/generate" className="underline hover:text-white font-semibold">
              Create your profile
            </Link>
            <span>or use Search at the top.</span>
          </p>
        </div>

        {/* Right preview illustration on desktop */}
        <div className="hidden lg:flex items-center justify-center p-8">
          <img
            src="/home.png"
            className="max-h-[82vh] w-auto object-contain drop-shadow-xl"
            alt="LinkPilot preview mockup"
          />
        </div>
      </section>
    </main>
  );
}
