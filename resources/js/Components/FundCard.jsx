import { Link } from '@inertiajs/react';
import { motion } from 'motion/react';
import { Wallet, Receipt, User } from 'lucide-react';

export default function FundCard({ fund }) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    return (
        <Link href={route('funds.show', fund.id)} viewTransition>
            <motion.article
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{
                    y: -4,
                    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
                }}
                whileTap={{ scale: 0.98 }}
                className="group block rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg hover:border-slate-300/80 dark:border-slate-700/80 dark:bg-slate-800 dark:hover:border-slate-600/80"
            >
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-slate-900 truncate dark:text-slate-100">
                            {fund.name}
                        </h3>
                        {fund.description && (
                            <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                                {fund.description}
                            </p>
                        )}
                    </div>
                    <span className="ml-2 shrink-0 rounded-full bg-accent-100 px-2.5 py-1 text-xs font-medium text-accent-700 dark:bg-accent-900/50 dark:text-accent-300">
                        {fund.role}
                    </span>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-6 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-accent-50 p-1.5 text-accent-600 transition-colors group-hover:bg-accent-100 dark:bg-accent-900/30 dark:group-hover:bg-accent-900/50">
                            <Wallet className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                Total
                            </p>
                            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                {formatCurrency(fund.total)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-right">
                        <div className="rounded-lg bg-slate-100 p-1.5 text-slate-600 transition-colors group-hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:group-hover:bg-slate-600">
                            <Receipt className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                Transactions
                            </p>
                            <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                                {fund.transaction_count}
                            </p>
                        </div>
                    </div>
                </div>

                {(fund.creator || fund.created_at_formatted || fund.created_at) && (
                    <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <User className="h-3.5 w-3 shrink-0" />
                        <span>
                            {[
                                fund.creator && `Created by ${fund.creator}`,
                                fund.created_at_formatted ?? fund.created_at,
                            ]
                                .filter(Boolean)
                                .join(' • ')}
                        </span>
                    </div>
                )}
            </motion.article>
        </Link>
    );
}
