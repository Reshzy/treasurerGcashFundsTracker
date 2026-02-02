import { Link } from '@inertiajs/react';

export default function FundCard({ fund }) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    return (
        <Link
            href={route('funds.show', fund.id)}
            className="block rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {fund.name}
                    </h3>
                    {fund.description && (
                        <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                            {fund.description}
                        </p>
                    )}
                </div>
                <span className="ml-4 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                    {fund.role}
                </span>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                <div>
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-xl font-bold text-gray-900">
                        {formatCurrency(fund.total)}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500">Transactions</p>
                    <p className="text-xl font-semibold text-gray-700">
                        {fund.transaction_count}
                    </p>
                </div>
            </div>

            <div className="mt-2 text-xs text-gray-500">
                Created by {fund.creator} • {fund.created_at_formatted ?? fund.created_at}
            </div>
        </Link>
    );
}
