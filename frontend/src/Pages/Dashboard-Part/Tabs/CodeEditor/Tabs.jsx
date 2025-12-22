import { useEffect, useState } from "react";

const LiveClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formattedTime = time
    .toLocaleTimeString("en-IN", {
      hour12: true,
      timeZone: "Asia/Kolkata",
    })
    .replace(/am|pm/, (match) => match.toUpperCase());

  return (
    <span className="text-xs text-slate-400 font-semibold">
      {formattedTime}
    </span>
  );
};

const tabIcons = {
  "Code Editor": (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
      />
    </svg>
  ),
  Whiteboard: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
      />
    </svg>
  ),
};

export default function Tabs({ tabs }) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="h-screen flex flex-col bg-[#0a0e27] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none"></div>

      <div className="relative z-20 flex items-center justify-between px-6 py-2.5 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 shadow-2xl">
        <div className="bg-white px-2 py-1 rounded-sm">
          <img
            src="https://res.cloudinary.com/dnlrzixy8/image/upload/v1756099243/upinterviewLogo_ng1wit.webp"
            alt="logo"
            className="w-24"
          />
        </div>
        <div className="flex items-center gap-6">
          {/* <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 transition-all cursor-pointer shadow-lg shadow-red-500/50"></div>
            <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 transition-all cursor-pointer shadow-lg shadow-yellow-500/50"></div>
            <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 transition-all cursor-pointer shadow-lg shadow-emerald-500/50"></div>
          </div> */}

          {/* <div className="h-8 w-px bg-slate-700/50"></div> */}

          <div className="flex gap-2">
            {tabs.map((tab, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                // className={`group relative px-6 py-3 font-bold transition-all duration-300 flex items-center gap-3 rounded-xl overflow-hidden ${
                //   activeTab === index
                //     ? "bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 text-white shadow-xl shadow-cyan-500/30 scale-105"
                //     : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                // }`}
                className={`text-xs group relative px-4 py-1.5 font-bold transition-all duration-300 flex items-center gap-3 rounded-md overflow-hidden ${
                  activeTab === index
                    ? "bg-gradient-to-r from-custom-blue via-custom-blue to-custom-blue/60 text-white shadow-xl shadow-cyan-500/30 scale-105"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                {activeTab === index && (
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 opacity-50 blur-xl"></div>
                )}
                <span className="relative z-10 text-xs">{tabIcons[tab.label]}</span>
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
        {/*
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-5 py-2.5 bg-slate-800/60 rounded-xl border border-slate-700/50 backdrop-blur-sm">
            <div className="relative">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
              <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></div>
            </div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Interview Session
            </span>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-800/60 to-slate-800/40 rounded-xl border border-slate-700/50 backdrop-blur-sm">
            <svg
              className="w-4 h-4 text-cyan-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-xs text-slate-400 font-semibold">
              <LiveClock />
            </span>
          </div>
        </div> */}
      </div>

      <div className="relative z-10 flex-1 overflow-hidden">
        {tabs[activeTab].content}
      </div>
    </div>
  );
}
