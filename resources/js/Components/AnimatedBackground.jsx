export default function AnimatedBackground() {
    return (
        <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        >
            {/* Soft color blobs */}
            <div className="absolute -left-16 top-[-12%] h-96 w-96 translate-y-4 rounded-full bg-accent-400/35 blur-3xl animate-bg-float-1 motion-reduce:animate-none dark:bg-emerald-500/25" />

            <div className="absolute right-[-14%] top-[18%] h-[28rem] w-[28rem] translate-y-6 rounded-full bg-sky-400/30 blur-3xl animate-bg-float-2 motion-reduce:animate-none dark:bg-indigo-500/25" />

            <div className="absolute left-[8%] top-[22%] h-80 w-80 translate-y-5 rounded-full bg-yellow-300/25 blur-3xl animate-bg-float-2 motion-reduce:animate-none dark:bg-amber-400/20" />

            <div className="absolute right-[10%] top-[-6%] h-72 w-72 translate-y-3 rounded-full bg-orange-300/25 blur-3xl animate-bg-float-1 motion-reduce:animate-none dark:bg-orange-400/20" />

            <div className="absolute left-[55%] top-[55%] h-[22rem] w-[22rem] translate-y-4 rounded-full bg-pink-400/20 blur-3xl animate-bg-float-1 motion-reduce:animate-none dark:bg-pink-500/18" />

            <div className="absolute -bottom-28 left-[18%] h-96 w-96 translate-y-2 rounded-full bg-rose-400/20 blur-3xl animate-bg-float-1 motion-reduce:animate-none dark:bg-fuchsia-500/20" />

            {/* Very subtle vignette to keep it calm/readable */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/0 to-white/35 dark:from-slate-950/0 dark:via-slate-950/0 dark:to-slate-950/40" />
        </div>
    );
}

