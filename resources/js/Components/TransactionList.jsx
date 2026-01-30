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
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Sender
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Category
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                            Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Notes
                        </th>
                        {canEdit && (
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                Actions
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                    {transactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-gray-50">
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                {transaction.date}
                            </td>
                            <td className="px-6 py-4 text-sm">
                                <div className="flex items-center">
                                    <span className="font-medium text-gray-900">
                                        {transaction.sender.name}
                                    </span>
                                    {transaction.sender.type === 'group' && (
                                        <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
                                            Group
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                {transaction.category || '-'}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-semibold text-green-600">
                                {formatCurrency(transaction.amount)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                                {transaction.notes ? (
                                    <span className="line-clamp-2">
                                        {transaction.notes}
                                    </span>
                                ) : (
                                    '-'
                                )}
                            </td>
                            {canEdit && (
                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                    <div className="flex justify-end gap-2">
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
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
