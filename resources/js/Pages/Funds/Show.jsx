import { useCallback, useEffect, useRef, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import TransactionList from '@/Components/TransactionList';
import TransactionFilters from '@/Components/TransactionFilters';
import TransactionForm from '@/Components/TransactionForm';
import Pagination from '@/Components/Pagination';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import { ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';

const selectClasses =
    'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100';

function applyFilters(fundId, params) {
    const { page, ...rest } = params;
    router.get(
        route('funds.show', fundId),
        Object.fromEntries(Object.entries(rest).filter(([, v]) => v != null && v !== '')),
        {
            preserveState: true,
            preserveScroll: true,
        },
    );
}

export default function Show({ fund, transactions, senders, savedMemberNames = [], users = [], filters = {} }) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [senderSearch, setSenderSearch] = useState(filters.sender_search ?? '');
    const [notesSearch, setNotesSearch] = useState(filters.notes ?? '');
    const [categorySearch, setCategorySearch] = useState(filters.category ?? '');
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters.date_to ?? '');
    const [createdFrom, setCreatedFrom] = useState(filters.created_from ?? '');
    const [createdTo, setCreatedTo] = useState(filters.created_to ?? '');
    const [amountMin, setAmountMin] = useState(filters.amount_min ?? '');
    const [amountMax, setAmountMax] = useState(filters.amount_max ?? '');
    const senderTimeoutRef = useRef(null);
    const notesTimeoutRef = useRef(null);
    const categoryTimeoutRef = useRef(null);

    useEffect(() => {
        setSenderSearch(filters.sender_search ?? '');
        setNotesSearch(filters.notes ?? '');
        setCategorySearch(filters.category ?? '');
        setDateFrom(filters.date_from ?? '');
        setDateTo(filters.date_to ?? '');
        setCreatedFrom(filters.created_from ?? '');
        setCreatedTo(filters.created_to ?? '');
        setAmountMin(filters.amount_min ?? '');
        setAmountMax(filters.amount_max ?? '');
    }, [
        filters.sender_search,
        filters.notes,
        filters.category,
        filters.date_from,
        filters.date_to,
        filters.created_from,
        filters.created_to,
        filters.amount_min,
        filters.amount_max,
    ]);

    const handleSenderSearchChange = useCallback(
        (value) => {
            setSenderSearch(value);
            if (senderTimeoutRef.current) clearTimeout(senderTimeoutRef.current);
            senderTimeoutRef.current = setTimeout(() => {
                applyFilters(fund.id, { ...filters, sender_search: value || undefined });
            }, 300);
        },
        [fund.id, filters],
    );

    const handleNotesSearchChange = useCallback(
        (value) => {
            setNotesSearch(value);
            if (notesTimeoutRef.current) clearTimeout(notesTimeoutRef.current);
            notesTimeoutRef.current = setTimeout(() => {
                applyFilters(fund.id, { ...filters, notes: value || undefined });
            }, 300);
        },
        [fund.id, filters],
    );

    const handleCategorySearchChange = useCallback(
        (value) => {
            setCategorySearch(value);
            if (categoryTimeoutRef.current) clearTimeout(categoryTimeoutRef.current);
            categoryTimeoutRef.current = setTimeout(() => {
                applyFilters(fund.id, { ...filters, category: value || undefined });
            }, 300);
        },
        [fund.id, filters],
    );

    useEffect(() => {
        return () => {
            if (senderTimeoutRef.current) clearTimeout(senderTimeoutRef.current);
            if (notesTimeoutRef.current) clearTimeout(notesTimeoutRef.current);
            if (categoryTimeoutRef.current) clearTimeout(categoryTimeoutRef.current);
        };
    }, []);

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
        applyFilters(fund.id, {});
    };

    const handleFilterChange = (key, value) => {
        const setters = {
            date_from: setDateFrom,
            date_to: setDateTo,
            created_from: setCreatedFrom,
            created_to: setCreatedTo,
            amount_min: setAmountMin,
            amount_max: setAmountMax,
        };
        setters[key]?.(value);
        applyFilters(fund.id, { ...filters, [key]: value || undefined });
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
    const canManageMembers = fund.can_manage_members ?? false;
    const initialHideAddMemberUi = usePage().props.auth?.user?.hide_add_member_ui ?? false;
    const [hideAddMemberUi, setHideAddMemberUiState] = useState(initialHideAddMemberUi);

    const addMemberForm = useForm({
        user_id: '',
        role: 'viewer',
    });

    const submitAddMember = (e) => {
        e.preventDefault();
        addMemberForm.post(route('funds.members.add', fund.id), {
            preserveScroll: true,
            onSuccess: () => addMemberForm.reset(),
        });
    };

    const removeMember = (userId) => {
        if (confirm('Are you sure you want to remove this member from the fund?')) {
            router.delete(route('funds.members.remove', [fund.id, userId]), {
                preserveScroll: true,
            });
        }
    };

    const setHideAddMemberUi = (hide) => {
        setHideAddMemberUiState(hide);
        axios.patch(route('profile.add-member-ui.update'), { hide }).catch(() => {
            setHideAddMemberUiState(!hide);
        });
    };

    const transactionList = transactions?.data ?? transactions ?? [];
    const transactionTotal = transactions?.total ?? transactionList.length;
    const hasActiveFilters =
        filters.sender_search ||
        filters.notes ||
        filters.category ||
        filters.date_from ||
        filters.date_to ||
        filters.created_from ||
        filters.created_to ||
        filters.amount_min ||
        filters.amount_max;

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
                                        {transactionTotal}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Members & Permissions */}
                    <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                        <p className="text-sm font-medium text-gray-700 mb-2 dark:text-slate-300">Members & Permissions</p>
                        <div className="mb-4 flex flex-wrap items-center gap-2">
                            {fund.members.map((member) => (
                                <span
                                    key={member.id}
                                    className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 dark:bg-slate-700 dark:text-slate-300"
                                >
                                    {member.name}
                                    <span className="text-xs text-gray-500 dark:text-slate-400">
                                        ({member.role})
                                    </span>
                                    {canManageMembers && member.role !== 'owner' && (
                                        <button
                                            type="button"
                                            onClick={() => removeMember(member.id)}
                                            className="ml-1 rounded p-0.5 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/40"
                                            aria-label={`Remove ${member.name}`}
                                        >
                                            ×
                                        </button>
                                    )}
                                </span>
                            ))}
                            {canManageMembers && users.length > 0 && (
                                <SecondaryButton
                                    type="button"
                                    onClick={() => setHideAddMemberUi(!hideAddMemberUi)}
                                    className={
                                        hideAddMemberUi
                                            ? '!border-indigo-300 !bg-indigo-50 !text-indigo-600 hover:!bg-indigo-100 dark:!border-indigo-600 dark:!bg-indigo-900/20 dark:!text-indigo-300 dark:hover:!bg-indigo-900/40'
                                            : '!border-indigo-300 !bg-indigo-100 !text-indigo-700 ring-2 ring-indigo-500 ring-offset-2 hover:!bg-indigo-200 dark:!border-indigo-600 dark:!bg-indigo-900/40 dark:!text-indigo-200 dark:ring-offset-slate-800 dark:hover:!bg-indigo-900/60'
                                    }
                                >
                                    {hideAddMemberUi ? (
                                        <>
                                            <ChevronDown className="mr-1.5 h-4 w-4" aria-hidden />
                                            Show add member
                                        </>
                                    ) : (
                                        <>
                                            <ChevronUp className="mr-1.5 h-4 w-4" aria-hidden />
                                            Hide add member
                                        </>
                                    )}
                                </SecondaryButton>
                            )}
                        </div>
                        {canManageMembers && users.length > 0 && !hideAddMemberUi && (
                            <form onSubmit={submitAddMember} className="flex flex-wrap items-end gap-4">
                                <div className="min-w-0 flex-1 basis-40">
                                    <InputLabel htmlFor="add_member_user" value="Add member" className="sr-only" />
                                    <select
                                        id="add_member_user"
                                        value={addMemberForm.data.user_id}
                                        onChange={(e) => addMemberForm.setData('user_id', e.target.value)}
                                        className={selectClasses}
                                        required
                                    >
                                        <option value="">Select user...</option>
                                        {users.map((u) => (
                                            <option key={u.id} value={u.id}>
                                                {u.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={addMemberForm.errors.user_id} className="mt-1" />
                                </div>
                                <div className="min-w-0 basis-32">
                                    <select
                                        id="add_member_role"
                                        value={addMemberForm.data.role}
                                        onChange={(e) => addMemberForm.setData('role', e.target.value)}
                                        className={selectClasses}
                                    >
                                        <option value="viewer">View only</option>
                                        <option value="member">View & edit</option>
                                    </select>
                                    <InputError message={addMemberForm.errors.role} className="mt-1" />
                                </div>
                                <PrimaryButton type="submit" disabled={addMemberForm.processing}>
                                    Add
                                </PrimaryButton>
                            </form>
                        )}
                        {canManageMembers && users.length === 0 && fund.members.length > 0 && (
                            <p className="text-xs text-gray-500 dark:text-slate-400">
                                All admins are already members of this fund.
                            </p>
                        )}
                    </div>

                    {/* Transaction Filters */}
                    <TransactionFilters
                        senderSearch={senderSearch}
                        onSenderSearchChange={handleSenderSearchChange}
                        notesSearch={notesSearch}
                        onNotesSearchChange={handleNotesSearchChange}
                        categorySearch={categorySearch}
                        onCategorySearchChange={handleCategorySearchChange}
                        dateFrom={dateFrom}
                        onDateFromChange={(v) => handleFilterChange('date_from', v)}
                        dateTo={dateTo}
                        onDateToChange={(v) => handleFilterChange('date_to', v)}
                        createdFrom={createdFrom}
                        onCreatedFromChange={(v) => handleFilterChange('created_from', v)}
                        createdTo={createdTo}
                        onCreatedToChange={(v) => handleFilterChange('created_to', v)}
                        amountMin={amountMin}
                        onAmountMinChange={(v) => handleFilterChange('amount_min', v)}
                        amountMax={amountMax}
                        onAmountMaxChange={(v) => handleFilterChange('amount_max', v)}
                        onClear={clearFilters}
                        resultCount={transactionTotal}
                    />

                    {/* Transactions */}
                    <TransactionList
                        transactions={transactionList}
                        fundId={fund.id}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        canEdit={canEdit}
                    />
                    {transactions?.links && (
                        <div className="mt-4 flex justify-center">
                            <Pagination links={transactions.links} only={['transactions', 'filters']} />
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Transaction Modal */}
            <Modal show={showAddModal} onClose={() => {
                setShowAddModal(false);
                setEditingTransaction(null);
            }}>
                <div className="max-h-[calc(100vh-8rem)] overflow-y-auto p-6 scrollbar-hide">
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
