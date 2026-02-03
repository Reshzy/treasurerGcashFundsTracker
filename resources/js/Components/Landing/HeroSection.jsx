import { Link } from '@inertiajs/react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
};

const item = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0 },
};

export default function HeroSection({ canLogin, canRegister }) {
    return (
        <section className="relative flex min-h-[85vh] items-center justify-center px-4 pt-24 pb-16 sm:px-6 lg:px-8">
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="mx-auto max-w-4xl text-center"
            >
                <motion.h1
                    variants={item}
                    className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl"
                >
                    Manage Your Funds.{' '}
                    <span className="bg-gradient-to-r from-accent-600 to-accent-500 bg-clip-text text-transparent">
                        Track Every Peso.
                    </span>
                </motion.h1>
                <motion.p
                    variants={item}
                    className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-400 sm:text-xl"
                >
                    Organize funds, manage senders, and record transactions in one
                    place. Simple, fast, and built for clarity.
                </motion.p>
                <motion.div
                    variants={item}
                    className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
                >
                    {canRegister && (
                        <Link
                            href={route('register')}
                            prefetch
                            className="group inline-flex items-center gap-2 rounded-xl bg-accent-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg transition-all duration-200 hover:bg-accent-700 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 active:scale-[0.98]"
                        >
                            Get Started
                            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </Link>
                    )}
                    {canLogin && (
                        <Link
                            href={route('login')}
                            prefetch
                            className="inline-flex items-center rounded-xl border-2 border-slate-200 bg-white/80 px-6 py-3.5 text-base font-semibold text-slate-700 backdrop-blur-sm transition-all duration-200 hover:border-slate-300 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 active:scale-[0.98] dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-800"
                        >
                            Log in
                        </Link>
                    )}
                </motion.div>
            </motion.div>
        </section>
    );
}
