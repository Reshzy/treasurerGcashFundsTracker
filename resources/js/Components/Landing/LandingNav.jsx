import ApplicationLogo from '@/Components/ApplicationLogo';
import ThemeToggle from '@/Components/ThemeToggle';
import { Link } from '@inertiajs/react';
import { motion, useScroll, useMotionValueEvent } from 'motion/react';
import { useRef, useState } from 'react';

export default function LandingNav({ auth }) {
    const { scrollY } = useScroll();
    const [isMinimized, setIsMinimized] = useState(false);
    const [isAtTop, setIsAtTop] = useState(true);
    const lastScrollY = useRef(0);

    useMotionValueEvent(scrollY, 'change', (latest) => {
        const diff = latest - lastScrollY.current;
        lastScrollY.current = latest;

        setIsAtTop(latest < 20);

        if (latest < 20) {
            setIsMinimized(false);
        } else if (diff > 0) {
            setIsMinimized(true);
        } else if (diff < 0) {
            setIsMinimized(false);
        }
    });

    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
                isMinimized
                    ? 'bg-white/90 py-2 shadow-md backdrop-blur-md dark:bg-slate-900/90 dark:shadow-slate-950/50'
                    : isAtTop
                      ? 'bg-transparent py-6'
                      : 'bg-white/80 py-5 shadow-sm backdrop-blur-md dark:bg-slate-900/80 dark:shadow-slate-950/50'
            }`}
        >
            <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/" className="flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 rounded-lg">
                    <ApplicationLogo
                        className={`fill-current text-slate-700 transition-all duration-300 dark:text-slate-300 ${
                            isMinimized ? 'h-9 w-9 sm:h-10 sm:w-10' : 'h-12 w-12 sm:h-14 sm:w-14'
                        }`}
                    />
                </Link>

                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    {auth?.user ? (
                        <Link
                            href={route('dashboard')}
                            prefetch
                            className="rounded-lg bg-accent-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-accent-700 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 active:scale-[0.98]"
                        >
                            Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link
                                href={route('login')}
                                prefetch
                                className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 dark:text-slate-300 dark:hover:text-white"
                            >
                                Log in
                            </Link>
                            <Link
                                href={route('register')}
                                prefetch
                                className="rounded-lg bg-accent-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-accent-700 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 active:scale-[0.98]"
                            >
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </nav>
        </motion.header>
    );
}
