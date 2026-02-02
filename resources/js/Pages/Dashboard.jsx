import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FundCard from '@/Components/FundCard';
import { Head, Link } from '@inertiajs/react';
import { motion, animate } from 'motion/react';
import { useEffect, useState } from 'react';
import {
    LayoutDashboard,
    Wallet,
    PiggyBank,
    Plus,
    FileText,
    Eye,
    FolderOpen,
} from 'lucide-react';

function AnimatedNumber({ value, format = (n) => n }) {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        const controls = animate(0, value, {
            duration: 1.2,
            ease: [0.22, 1, 0.36, 1],
            onUpdate: (latest) => setDisplayValue(latest),
        });
        return () => controls.stop();
    }, [value]);

    return <span>{format(Math.round(displayValue))}</span>;
}

export default function Dashboard({ funds, totalFunds, totalAmount }) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.1,
            },
        },
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-slate-800 dark:text-slate-200">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Hero Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="mb-10 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-xl"
                    >
                        <div className="flex items-center gap-3 text-slate-300">
                            <LayoutDashboard className="h-6 w-6" />
                            <span className="text-sm font-medium uppercase tracking-wider">
                                Total Balance
                            </span>
                        </div>
                        <p className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
                            <AnimatedNumber
                                value={totalAmount}
                                format={(n) => formatCurrency(n)}
                            />
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                            Across all your funds
                        </p>
                    </motion.div>

                    {/* Stats Row */}
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="mb-10 grid gap-6 sm:grid-cols-2"
                    >
                        <motion.div
                            variants={item}
                            className="group overflow-hidden rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700/80 dark:bg-slate-800"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                        Total Funds
                                    </p>
                                    <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
                                        {totalFunds}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-accent-100 p-3 text-accent-600 transition-colors group-hover:bg-accent-200 dark:bg-accent-900/50 dark:text-accent-300 dark:group-hover:bg-accent-900/70">
                                    <Wallet className="h-8 w-8" />
                                </div>
                            </div>
                        </motion.div>
                        <motion.div
                            variants={item}
                            className="group overflow-hidden rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700/80 dark:bg-slate-800"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                        Total Amount
                                    </p>
                                    <p className="mt-2 text-3xl font-bold text-accent-600 dark:text-accent-400">
                                        {formatCurrency(totalAmount)}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-accent-100 p-3 text-accent-600 transition-colors group-hover:bg-accent-200 dark:bg-accent-900/50 dark:text-accent-300 dark:group-hover:bg-accent-900/70">
                                    <PiggyBank className="h-8 w-8" />
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Quick Actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="mb-10 flex flex-wrap gap-3"
                    >
                        <Link
                            href={route('funds.create')}
                            viewTransition
                            className="inline-flex items-center gap-2 rounded-xl bg-accent-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-accent-700 hover:shadow-md active:scale-[0.98]"
                        >
                            <Plus className="h-4 w-4" />
                            Create Fund
                        </Link>
                        <Link
                            href={route('senders.create')}
                            viewTransition
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-700"
                        >
                            <FileText className="h-4 w-4" />
                            Create Sender
                        </Link>
                        <Link
                            href={route('funds.index')}
                            viewTransition
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-700"
                        >
                            <Eye className="h-4 w-4" />
                            View All Funds
                        </Link>
                    </motion.div>

                    {/* Recent Funds */}
                    {funds.length > 0 ? (
                        <motion.div
                            variants={container}
                            initial="hidden"
                            animate="show"
                        >
                            <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
                                Recent Funds
                            </h3>
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {funds.map((fund, index) => (
                                    <motion.div key={fund.id} variants={item}>
                                        <FundCard fund={fund} />
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="rounded-2xl border border-slate-200/80 bg-white p-16 text-center shadow-sm dark:border-slate-700/80 dark:bg-slate-800"
                        >
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-700">
                                <FolderOpen className="h-8 w-8 text-slate-400" />
                            </div>
                            <p className="text-lg font-medium text-slate-600 dark:text-slate-300">
                                No funds yet
                            </p>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Create your first fund to get started.
                            </p>
                            <Link
                                href={route('funds.create')}
                                viewTransition
                                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-accent-700 hover:shadow-md active:scale-[0.98]"
                            >
                                <Plus className="h-4 w-4" />
                                Create Fund
                            </Link>
                        </motion.div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
