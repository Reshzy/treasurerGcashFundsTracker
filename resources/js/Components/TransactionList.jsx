import DangerButton from './DangerButton';
import PrimaryButton from './PrimaryButton';
import { router } from '@inertiajs/react';

export default function TransactionList({ transactions, fundId, onEdit, onDelete, canEdit = true }) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    if (transactions.length === 0) {
        return (
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
                <p className="text-gray-500">No transactions yet.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {transactions.map((transaction) => (
                <div
                    key={transaction.id}
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                >
                    <div className="flex items-start justify-between gap-2">
                        <span className="text-sm text-gray-500">{transaction.date}</span>
                        {transaction.category && (
                            <span className="text-xs text-gray-400">{transaction.category}</span>
                        )}
                    </div>
                    <div className="mt-2">
                        <div className="flex items-center flex-wrap gap-1.5">
                            <span className="font-medium text-gray-900">
                                {transaction.sender.name}
                            </span>
                            {transaction.sender.type === 'group' && (
                                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
                                    Group
                                </span>
                            )}
                        </div>
                        {transaction.sender.type === 'group' &&
                            transaction.sender.members &&
                            transaction.sender.members.length > 0 && (
                                <p className="mt-1 text-xs text-gray-500">
                                    {transaction.sender.members.join(', ')}
                                </p>
                            )}
                    </div>
                    <p className="mt-2 text-lg font-semibold text-green-600">
                        {formatCurrency(transaction.amount)}
                    </p>
                    {transaction.notes && (
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                            {transaction.notes}
                        </p>
                    )}
                    {canEdit && (
                        <div className="mt-3 flex justify-end gap-2 border-t border-gray-100 pt-3">
                            <PrimaryButton
                                onClick={() => onEdit(transaction)}
                                className="px-3 py-1 text-xs"
                            >
                                Edit
                            </PrimaryButton>
                            {onDelete && (
                                <DangerButton
                                    onClick={() => onDelete(transaction.id)}
                                    className="px-3 py-1 text-xs"
                                >
                                    Delete
                                </DangerButton>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
