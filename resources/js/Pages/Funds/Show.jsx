import { useMemo, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import TransactionList from '@/Components/TransactionList';
import TransactionFilters from '@/Components/TransactionFilters';
import TransactionForm from '@/Components/TransactionForm';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import { Head, Link, router } from '@inertiajs/react';

function filterTransactions(
    transactions,
    { senderSearch, notesSearch, categorySearch, dateFrom, dateTo, createdFrom, createdTo, amountMin, amountMax },
) {
    return transactions.filter((t) => {
        const search = (senderSearch || '').trim().toLowerCase();
        if (search) {
            const senderNameMatch = (t.sender?.name || '').toLowerCase().includes(search);
            const memberMatch =
                t.sender?.type === 'group' &&
                Array.isArray(t.sender.members) &&
                t.sender.members.some((m) => String(m).toLowerCase().includes(search));
            if (!senderNameMatch && !memberMatch) return false;
        }
        const notesSearchLower = (notesSearch || '').trim().toLowerCase();
        if (notesSearchLower && !(t.notes || '').toLowerCase().includes(notesSearchLower)) return false;
        const categorySearchLower = (categorySearch || '').trim().toLowerCase();
        if (categorySearchLower && !(t.category || '').toLowerCase().includes(categorySearchLower)) return false;
        if (dateFrom && t.date < dateFrom) return false;
        if (dateTo && t.date > dateTo) return false;
        const createdDate = t.created_at ? t.created_at.slice(0, 10) : '';
        if (createdFrom && createdDate < createdFrom) return false;
        if (createdTo && createdDate > createdTo) return false;
        const amount = parseFloat(t.amount);
        if (amountMin !== '' && !Number.isNaN(parseFloat(amountMin)) && amount < parseFloat(amountMin))
            return false;
        if (amountMax !== '' && !Number.isNaN(parseFloat(amountMax)) && amount > parseFloat(amountMax))
            return false;
        return true;
    });
}

export default function Show({ fund, transactions, senders, savedMemberNames = [] }) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [senderSearch, setSenderSearch] = useState('');
    const [notesSearch, setNotesSearch] = useState('');
    const [categorySearch, setCategorySearch] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [createdFrom, setCreatedFrom] = useState('');
    const [createdTo, setCreatedTo] = useState('');
    const [amountMin, setAmountMin] = useState('');
    const [amountMax, setAmountMax] = useState('');

    const filteredTransactions = useMemo(
        () =>
            filterTransactions(transactions, {
                senderSearch,
                notesSearch,
                categorySearch,
                dateFrom,
                dateTo,
                createdFrom,
                createdTo,
                amountMin,
                amountMax,
            }),
        [transactions, senderSearch, notesSearch, categorySearch, dateFrom, dateTo, createdFrom, createdTo, amountMin, amountMax],
    );

    const clearFilters = () => {
        setSenderSearch('');
        setNotesSearch('');
        setCategorySearch('');
        setDateFrom('');
        setDateTo('');
        setCreatedFrom('');
        setCreatedTo('');
        setAmountMin('');
        setAmountMax('');
    };

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

                    {/* Transaction Filters */}
                    <TransactionFilters
                        senderSearch={senderSearch}
                        onSenderSearchChange={setSenderSearch}
                        notesSearch={notesSearch}
                        onNotesSearchChange={setNotesSearch}
                        categorySearch={categorySearch}
                        onCategorySearchChange={setCategorySearch}
                        dateFrom={dateFrom}
                        onDateFromChange={setDateFrom}
                        dateTo={dateTo}
                        onDateToChange={setDateTo}
                        createdFrom={createdFrom}
                        onCreatedFromChange={setCreatedFrom}
                        createdTo={createdTo}
                        onCreatedToChange={setCreatedTo}
                        amountMin={amountMin}
                        onAmountMinChange={setAmountMin}
                        amountMax={amountMax}
                        onAmountMaxChange={setAmountMax}
                        onClear={clearFilters}
                        resultCount={filteredTransactions.length}
                    />

                    {/* Transactions */}
                    <TransactionList
                        transactions={filteredTransactions}
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
