import { Link } from '@inertiajs/react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

export default function CTASection({ canLogin, canRegister }) {
    return (
        <section className="relative px-4 py-24 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent-600 via-accent-500 to-accent-700 px-8 py-16 text-center shadow-2xl sm:px-12 sm:py-20"
            >
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
                <div className="relative">
                    <h2 className="text-3xl font-bold text-white sm:text-4xl">
                        Ready to get started?
                    </h2>
                    <p className="mx-auto mt-4 max-w-xl text-lg text-accent-100">
                        Create your account and start managing your funds in minutes.
                    </p>
                    <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                        {canRegister && (
                            <Link
                                href={route('register')}
                                prefetch
                                className="group inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-accent-600 shadow-lg transition-all duration-200 hover:bg-accent-50 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-accent-600 active:scale-[0.98]"
                            >
                                Get Started
                                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Link>
                        )}
                        {canLogin && (
                            <Link
                                href={route('login')}
                                prefetch
                                className="inline-flex items-center rounded-xl border-2 border-white/30 bg-white/10 px-6 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/20 hover:border-white/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-accent-600"
                            >
                                Log in
                            </Link>
                        )}
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
