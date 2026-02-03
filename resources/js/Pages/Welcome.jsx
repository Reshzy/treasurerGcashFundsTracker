import AnimatedBackground from '@/Components/AnimatedBackground';
import CTASection from '@/Components/Landing/CTASection';
import FeatureCard from '@/Components/Landing/FeatureCard';
import HeroSection from '@/Components/Landing/HeroSection';
import HowItWorksStep from '@/Components/Landing/HowItWorksStep';
import LandingNav from '@/Components/Landing/LandingNav';
import { Head } from '@inertiajs/react';
import { FileText, TrendingUp, Users, Wallet } from 'lucide-react';

export default function Welcome({ auth, canLogin, canRegister }) {
    return (
        <>
            <Head title="Welcome" />
            <div className="relative min-h-screen bg-gray-50/70 dark:bg-slate-950/85">
                <AnimatedBackground />
                <LandingNav auth={auth} />

                <main>
                    <HeroSection canLogin={canLogin} canRegister={canRegister} />

                    <section className="relative px-4 py-20 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-7xl">
                            <h2 className="text-center text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
                                Everything you need to manage funds
                            </h2>
                            <p className="mx-auto mt-4 max-w-2xl text-center text-slate-600 dark:text-slate-400">
                                Simple tools to organize, track, and grow your funds with
                                clarity and control.
                            </p>
                            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                                <FeatureCard
                                    icon={Wallet}
                                    title="Track Funds"
                                    description="Create and organize multiple funds. See totals at a glance and drill down into each fund's details."
                                    index={0}
                                />
                                <FeatureCard
                                    icon={Users}
                                    title="Manage Senders"
                                    description="Keep a directory of senders. Link them to transactions and track who contributes to each fund."
                                    index={1}
                                />
                                <FeatureCard
                                    icon={TrendingUp}
                                    title="Real-time Transactions"
                                    description="Record deposits and withdrawals instantly. Your dashboard updates in real time with accurate totals."
                                    index={2}
                                />
                            </div>
                        </div>
                    </section>

                    <section className="relative px-4 py-20 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-7xl">
                            <h2 className="text-center text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
                                How it works
                            </h2>
                            <p className="mx-auto mt-4 max-w-2xl text-center text-slate-600 dark:text-slate-400">
                                Get started in three simple steps.
                            </p>
                            <div className="mt-16 grid gap-12 sm:grid-cols-3">
                                <HowItWorksStep
                                    number={1}
                                    icon={FileText}
                                    title="Create a Fund"
                                    description="Set up a fund with a name and description. You can create multiple funds for different purposes."
                                    index={0}
                                />
                                <HowItWorksStep
                                    number={2}
                                    icon={Users}
                                    title="Add Senders"
                                    description="Add people or sources who contribute. Senders can be linked to multiple funds."
                                    index={1}
                                />
                                <HowItWorksStep
                                    number={3}
                                    icon={TrendingUp}
                                    title="Record Transactions"
                                    description="Log deposits and withdrawals. Assign each transaction to a sender and fund."
                                    index={2}
                                />
                            </div>
                        </div>
                    </section>

                    <CTASection canLogin={canLogin} canRegister={canRegister} />
                </main>

                <footer className="relative border-t border-slate-200/80 px-4 py-12 dark:border-slate-800">
                    <div className="mx-auto max-w-7xl text-center">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Gcash750 — Manage your funds with clarity.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
