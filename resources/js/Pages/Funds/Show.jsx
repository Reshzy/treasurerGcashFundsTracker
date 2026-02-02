import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import TransactionList from '@/Components/TransactionList';
import TransactionForm from '@/Components/TransactionForm';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import { Head, Link, router } from '@inertiajs/react';

export default function Show({ fund, transactions, senders, savedMemberNames = [] }) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    const handleDelete = (transactionId) => {
        if (confirm('Are you sure you want to delete this transaction?')) {
            router.delete(route('transactions.destroy', transactionId), {
                preserveScroll: true,
            });
        }
    };

    const handleEdit = (transaction) => {
        setEditingTransaction(transaction);
        setShowAddModal(true);
    };

    const canEdit = fund.user_role === 'owner' || fund.user_role === 'member';

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-slate-200">
                            {fund.name}
                        </h2>
                        {fund.description && (
                            <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">{fund.description}</p>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {canEdit && (
                            <>
                                <Link href={route('funds.edit', fund.id)}>
                                    <PrimaryButton>Edit Fund</PrimaryButton>
                                </Link>
                                <PrimaryButton onClick={() => setShowAddModal(true)}>
                                    Add Transaction
                                </PrimaryButton>
                            </>
                        )}
                    </div>
                </div>
            }
        >
            <Head title={fund.name} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Summary Card */}
                    <div className="mb-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Total Amount</p>
                                    <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-slate-100">
                                        {formatCurrency(fund.total)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Transactions</p>
                                    <p className="mt-1 text-3xl font-bold text-gray-700 dark:text-slate-300">
                                        {transactions.length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Members */}
                    {fund.members.length > 0 && (
                        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                            <p className="text-sm font-medium text-gray-700 mb-2 dark:text-slate-300">Members:</p>
                            <div className="flex flex-wrap gap-2">
                                {fund.members.map((member) => (
                                    <span
                                        key={member.id}
                                        className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 dark:bg-slate-700 dark:text-slate-300"
                                    >
                                        {member.name}
                                        <span className="ml-2 text-xs text-gray-500 dark:text-slate-400">
                                            ({member.role})
                                        </span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Transactions */}
                    <TransactionList
                        transactions={transactions}
                        fundId={fund.id}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        canEdit={canEdit}
                    />
                </div>
            </div>

            {/* Add/Edit Transaction Modal */}
            <Modal show={showAddModal} onClose={() => {
                setShowAddModal(false);
                setEditingTransaction(null);
            }}>
                <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-slate-100">
                        {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
                    </h3>
                    <TransactionForm
                        fundId={fund.id}
                        senders={senders}
                        savedMemberNames={savedMemberNames}
                        transaction={editingTransaction}
                        onCancel={() => {
                            setShowAddModal(false);
                            setEditingTransaction(null);
                        }}
                    />
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
