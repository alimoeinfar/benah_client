export function RetinalGraphic() {
  return (
    <div className="relative w-72 h-72 sm:w-96 sm:h-96">
      {/* Outer glow ring */}
      <div className="absolute inset-0 rounded-full bg-teal-500/10 blur-3xl" />

      {/* Main circle (simulates fundus image) */}
      <div className="absolute inset-4 rounded-full bg-gradient-to-br from-orange-950 via-red-950 to-rose-900 shadow-2xl border border-teal-500/20">

        {/* Optic disc */}
        <div className="absolute top-[30%] left-[40%] h-14 w-14 rounded-full bg-gradient-to-br from-yellow-300/80 to-orange-300/60 blur-sm" />

        {/* Blood vessels — SVG overlay */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main vessels radiating from optic disc (~88,70) */}
          <path d="M88 70 C70 90 50 100 30 130" stroke="#f97316" strokeWidth="1.5" strokeOpacity="0.6" />
          <path d="M88 70 C100 85 110 100 120 140" stroke="#f97316" strokeWidth="1.2" strokeOpacity="0.5" />
          <path d="M88 70 C80 60 60 50 40 60" stroke="#f97316" strokeWidth="1" strokeOpacity="0.5" />
          <path d="M88 70 C95 60 110 55 130 50" stroke="#f97316" strokeWidth="1" strokeOpacity="0.5" />
          <path d="M88 70 C110 80 130 90 150 80" stroke="#f97316" strokeWidth="1.2" strokeOpacity="0.4" />
          <path d="M30 130 C25 145 35 160 50 165" stroke="#f97316" strokeWidth="0.8" strokeOpacity="0.4" />
          <path d="M120 140 C130 155 120 170 105 175" stroke="#f97316" strokeWidth="0.8" strokeOpacity="0.4" />
        </svg>

        {/* Macula (fovea) */}
        <div className="absolute top-[44%] left-[55%] h-6 w-6 rounded-full bg-orange-900/80 border border-red-800/40" />

        {/* AI scan overlay — animated ring */}
        <div className="absolute inset-6 rounded-full border border-teal-400/30 animate-ping" style={{ animationDuration: "3s" }} />
        <div className="absolute inset-6 rounded-full border border-teal-400/20" />

        {/* Detection markers */}
        <div className="absolute top-[22%] left-[60%] h-5 w-5 rounded-full border-2 border-teal-400 bg-teal-400/10" />
        <div className="absolute top-[55%] left-[25%] h-4 w-4 rounded-full border-2 border-yellow-400 bg-yellow-400/10" />
      </div>

      {/* Floating badge */}
      <div className="absolute -bottom-2 -right-2 flex items-center gap-2 rounded-xl border border-teal-500/30 bg-teal-950/80 px-4 py-2 backdrop-blur text-xs text-teal-300 shadow-xl">
        <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
        AI analysis complete
      </div>
    </div>
  );
}
