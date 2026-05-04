import { useEffect, useMemo, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ClientPagination from '@/Components/ClientPagination';
import TransactionList from '@/Components/TransactionList';
import TransactionFilters from '@/Components/TransactionFilters';
import TransactionForm from '@/Components/TransactionForm';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import { ArrowLeft, BarChart3, ChevronDown, ChevronUp, Download, PieChart, X } from 'lucide-react';
import axios from 'axios';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    Tooltip,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const selectClasses =
    'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100';

function normalizeCategoryLabel(value) {
    const normalized = String(value ?? '').trim();

    return normalized === '' ? 'Uncategorized' : normalized;
}

function filterTransactions(transactions, filters) {
    const {
        senderSearch = '',
        notesSearch = '',
        categorySearch = '',
        dateFrom = '',
        dateTo = '',
        createdFrom = '',
        createdTo = '',
        amountMin = '',
        amountMax = '',
    } = filters;

    return transactions.filter((t) => {
        const senderMatch = !senderSearch.trim()
            || (t.sender?.name?.toLowerCase().includes(senderSearch.toLowerCase()))
            || (t.sender?.members?.some((m) => m?.toLowerCase().includes(senderSearch.toLowerCase())));
        const notesMatch = !notesSearch.trim() || (t.notes?.toLowerCase().includes(notesSearch.toLowerCase()));
        const categoryMatch = !categorySearch.trim() || (t.category?.toLowerCase().includes(categorySearch.toLowerCase()));
        const dateFromMatch = !dateFrom || t.date >= dateFrom;
        const dateToMatch = !dateTo || t.date <= dateTo;
        const createdDate = String(t.created_at || '').slice(0, 10);
        const createdFromMatch = !createdFrom || createdDate >= createdFrom;
        const createdToMatch = !createdTo || createdDate <= createdTo;
        const amountMinMatch = amountMin === '' || Number(t.amount) >= Number(amountMin);
        const amountMaxMatch = amountMax === '' || Number(t.amount) <= Number(amountMax);

        return senderMatch && notesMatch && categoryMatch && dateFromMatch && dateToMatch
            && createdFromMatch && createdToMatch && amountMinMatch && amountMaxMatch;
    });
}

function normalizeCategoryTotals(categoryTotals) {
    return categoryTotals.map((item, index) => ({
        category: item.category || `Category ${index + 1}`,
        total: Number(item.total) || 0,
        transactionCount: Number(item.transaction_count) || 0,
    }));
}

const categoryChartPalette = [
    '#4f46e5',
    '#0284c7',
    '#0ea5e9',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#a855f7',
    '#6366f1',
];

function useIsDarkMode() {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof document === 'undefined') {
            return false;
        }

        return document.documentElement.classList.contains('dark');
    });

    useEffect(() => {
        if (typeof document === 'undefined') {
            return undefined;
        }

        const root = document.documentElement;
        const observer = new MutationObserver(() => {
            setIsDarkMode(root.classList.contains('dark'));
        });
        observer.observe(root, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);

    return isDarkMode;
}

function CategoryChartEmptyState({ message }) {
    return (
        <div className="rounded-lg border border-dashed border-slate-300/80 bg-slate-50/60 p-6 text-center dark:border-slate-600 dark:bg-slate-800/30">
            <p className="text-sm text-slate-500 dark:text-slate-400">
                {message}
            </p>
        </div>
    );
}

function CategoryTotalsBarChart({ categoryTotals, formatCurrency, isDarkMode }) {
    const normalizedData = useMemo(() => normalizeCategoryTotals(categoryTotals), [categoryTotals]);

    if (normalizedData.length === 0) {
        return <CategoryChartEmptyState message="No category data available yet." />;
    }

    const chartTextColor = isDarkMode ? '#cbd5e1' : '#475569';
    const chartGridColor = isDarkMode ? 'rgba(148, 163, 184, 0.22)' : 'rgba(148, 163, 184, 0.28)';
    const barBorderColor = isDarkMode ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.95)';
    const labels = normalizedData.map((item) => item.category);

    const data = useMemo(() => {
        return {
            labels,
            datasets: [
                {
                    label: 'Category total',
                    data: normalizedData.map((item) => item.total),
                    backgroundColor: normalizedData.map((item) => (item.total < 0 ? 'rgba(239, 68, 68, 0.85)' : 'rgba(79, 70, 229, 0.85)')),
                    borderColor: normalizedData.map(() => barBorderColor),
                    borderWidth: 1.5,
                    borderRadius: 8,
                    borderSkipped: false,
                    maxBarThickness: 42,
                },
            ],
        };
    }, [barBorderColor, labels, normalizedData]);

    const options = useMemo(() => {
        return {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 350 },
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(15, 23, 42, 0.92)',
                    titleColor: '#f8fafc',
                    bodyColor: '#f8fafc',
                    borderWidth: 0,
                    padding: 12,
                    callbacks: {
                        title: (items) => items[0]?.label ?? '',
                        label: (context) => {
                            const item = normalizedData[context.dataIndex];
                            if (!item) {
                                return '';
                            }

                            return `${formatCurrency(item.total)} · ${item.transactionCount} txn${item.transactionCount === 1 ? '' : 's'}`;
                        },
                    },
                },
            },
            scales: {
                x: {
                    ticks: {
                        color: chartTextColor,
                        maxRotation: 0,
                        autoSkip: false,
                        callback: (_, index) => {
                            const label = labels[index] ?? '';
                            return label.length > 16 ? `${label.slice(0, 16)}...` : label;
                        },
                    },
                    grid: {
                        display: false,
                    },
                },
                y: {
                    ticks: {
                        color: chartTextColor,
                        maxTicksLimit: 6,
                        callback: (value) => formatCurrency(Number(value)),
                    },
                    grid: {
                        color: chartGridColor,
                    },
                },
            },
        };
    }, [chartGridColor, chartTextColor, formatCurrency, isDarkMode, labels, normalizedData]);

    return (
        <div className="rounded-xl border border-slate-200/80 bg-white/70 p-4 dark:border-slate-600/80 dark:bg-slate-800/30">
            <div className="relative h-72 w-full sm:h-80">
                <Bar
                    data={data}
                    options={options}
                    aria-label="Bar chart of category totals"
                    role="img"
                />
            </div>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                Positive totals are shown in indigo, and negative totals are highlighted in red.
            </p>
        </div>
    );
}

function CategoryTotalsPieChart({ categoryTotals, formatCurrency, isDarkMode }) {
    const normalizedData = useMemo(() => normalizeCategoryTotals(categoryTotals), [categoryTotals]);

    if (normalizedData.length === 0) {
        return <CategoryChartEmptyState message="No category data available yet." />;
    }

    const positiveData = normalizedData.filter((item) => item.total > 0);
    const positiveTotal = positiveData.reduce((sum, item) => sum + item.total, 0);

    if (positiveData.length === 0 || positiveTotal <= 0) {
        return <CategoryChartEmptyState message="Pie chart requires at least one positive category total." />;
    }

    const chartTextColor = isDarkMode ? '#cbd5e1' : '#475569';
    const chartBorderColor = isDarkMode ? '#0f172a' : '#ffffff';
    const backgroundColors = positiveData.map((_, index) => categoryChartPalette[index % categoryChartPalette.length]);

    const data = useMemo(() => {
        return {
            labels: positiveData.map((item) => item.category),
            datasets: [
                {
                    data: positiveData.map((item) => item.total),
                    backgroundColor: backgroundColors,
                    borderColor: chartBorderColor,
                    borderWidth: 2,
                    hoverOffset: 8,
                },
            ],
        };
    }, [backgroundColors, chartBorderColor, positiveData]);

    const options = useMemo(() => {
        return {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 350 },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: chartTextColor,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        boxWidth: 10,
                        padding: 16,
                    },
                },
                tooltip: {
                    backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(15, 23, 42, 0.92)',
                    titleColor: '#f8fafc',
                    bodyColor: '#f8fafc',
                    borderWidth: 0,
                    padding: 12,
                    callbacks: {
                        label: (context) => {
                            const item = positiveData[context.dataIndex];
                            if (!item) {
                                return '';
                            }

                            const ratio = (item.total / positiveTotal) * 100;
                            return `${formatCurrency(item.total)} (${ratio.toFixed(1)}%) · ${item.transactionCount} txn${item.transactionCount === 1 ? '' : 's'}`;
                        },
                    },
                },
            },
        };
    }, [chartTextColor, formatCurrency, isDarkMode, positiveData, positiveTotal]);

    return (
        <div className="rounded-xl border border-slate-200/80 bg-white/70 p-4 dark:border-slate-600/80 dark:bg-slate-800/30">
            <div className="relative mx-auto h-80 w-full max-w-2xl sm:h-96">
                <Pie
                    data={data}
                    options={options}
                    aria-label="Pie chart of positive category totals"
                    role="img"
                />
            </div>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                Pie view shows only positive category totals to preserve percentage accuracy.
            </p>
        </div>
    );
}

function CategoryTotalsCards({ categoryTotals, formatCurrency }) {
    if (categoryTotals.length === 0) {
        return (
            <div className="rounded-lg border border-dashed border-slate-300/80 bg-slate-50/60 p-6 text-center dark:border-slate-600 dark:bg-slate-800/30">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    No category data available yet.
                </p>
            </div>
        );
    }

    const normalizedData = normalizeCategoryTotals(categoryTotals);

    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {normalizedData.map((item, index) => (
                <div
                    key={`card-item-${item.category}-${index}`}
                    className="rounded-lg border border-slate-200/80 bg-slate-50 p-4 dark:border-slate-600/80 dark:bg-slate-700/40"
                >
                    <p className="truncate text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        {item.category}
                    </p>
                    <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-slate-100">
                        {formatCurrency(item.total)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {item.transactionCount} transaction{item.transactionCount === 1 ? '' : 's'}
                    </p>
                </div>
            ))}
        </div>
    );
}

export default function Show({ fund, transactions, senders, savedMemberNames = [], users = [] }) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showExportOptionsModal, setShowExportOptionsModal] = useState(false);
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
    const [categoryViewMode, setCategoryViewMode] = useState('bar');
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage] = useState(12);
    const isDarkMode = useIsDarkMode();

    const allTransactions = Array.isArray(transactions) ? transactions : [];
    const categoryTotals = Array.isArray(fund.category_totals) ? fund.category_totals : [];
    const exportCategoryOptions = categoryTotals
        .map((item) => normalizeCategoryLabel(item?.category))
        .filter((value, index, array) => array.indexOf(value) === index);
    const [selectedExportCategories, setSelectedExportCategories] = useState(exportCategoryOptions);
    const filteredTransactions = filterTransactions(allTransactions, {
        senderSearch,
        notesSearch,
        categorySearch,
        dateFrom,
        dateTo,
        createdFrom,
        createdTo,
        amountMin,
        amountMax,
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [
        senderSearch,
        notesSearch,
        categorySearch,
        dateFrom,
        dateTo,
        createdFrom,
        createdTo,
        amountMin,
        amountMax,
    ]);

    const start = (currentPage - 1) * perPage;
    const paginatedTransactions = filteredTransactions.slice(start, start + perPage);

    const handleSenderSearchChange = (value) => setSenderSearch(value);
    const handleNotesSearchChange = (value) => setNotesSearch(value);
    const handleCategorySearchChange = (value) => setCategorySearch(value);

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

    const openExportOptions = () => {
        setSelectedExportCategories(exportCategoryOptions);
        setShowExportOptionsModal(true);
    };

    const closeExportOptions = () => {
        setShowExportOptionsModal(false);
    };

    const toggleExportCategory = (category) => {
        setSelectedExportCategories((currentCategories) => {
            if (currentCategories.includes(category)) {
                return currentCategories.filter((currentCategory) => currentCategory !== category);
            }

            return [...currentCategories, category];
        });
    };

    const buildExportUrl = (categories = selectedExportCategories) => {
        const baseUrl = route('funds.transactions.export', fund.id);

        if (categories.length === 0) {
            return baseUrl;
        }

        const params = new URLSearchParams();
        categories.forEach((category) => {
            params.append('categories[]', category);
        });

        return `${baseUrl}?${params.toString()}`;
    };

    const exportWithSelectedCategories = () => {
        window.location.href = buildExportUrl();
        closeExportOptions();
    };

    const exportAllCategories = () => {
        window.location.href = buildExportUrl([]);
        closeExportOptions();
    };

    const setHideAddMemberUi = (hide) => {
        setHideAddMemberUiState(hide);
        axios.patch(route('profile.add-member-ui.update'), { hide }).catch(() => {
            setHideAddMemberUiState(!hide);
        });
    };

    const hasActiveFilters =
        senderSearch ||
        notesSearch ||
        categorySearch ||
        dateFrom ||
        dateTo ||
        createdFrom ||
        createdTo ||
        amountMin ||
        amountMax;

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
                        <Link href={route('funds.index')} aria-label="Back to Funds">
                            <SecondaryButton>
                                <ArrowLeft className="mr-1 h-4 w-4" aria-hidden />
                                Back to Funds
                            </SecondaryButton>
                        </Link>
                        <button
                            type="button"
                            onClick={openExportOptions}
                            className="inline-flex items-center rounded-md border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-indigo-700 shadow-sm transition duration-150 ease-in-out hover:bg-indigo-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:border-indigo-500/60 dark:bg-indigo-500/20 dark:text-indigo-200 dark:hover:bg-indigo-500/30 dark:focus-visible:ring-offset-slate-800"
                        >
                            <Download className="mr-1.5 h-4 w-4" aria-hidden />
                            Export Options
                        </button>
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
                    <div className="mb-6 overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-700/80 dark:bg-slate-800">
                        <div className="p-6">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Amount</p>
                                    <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-slate-100">
                                        {formatCurrency(fund.total)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Visible Transactions</p>
                                    <p className="mt-1 text-3xl font-bold text-slate-700 dark:text-slate-300">
                                        {filteredTransactions.length}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-700">
                                <div className="mb-3 flex items-center justify-between gap-2">
                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                        Category Breakdown
                                    </p>

                                    <div className="mb-4 flex items-center justify-end">
                                        <div
                                            role="group"
                                            aria-label="Category breakdown chart type"
                                            className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-600 dark:bg-slate-700/40"
                                        >
                                            <button
                                                type="button"
                                                onClick={() => setCategoryViewMode('bar')}
                                                aria-pressed={categoryViewMode === 'bar'}
                                                aria-label="Show category totals as bar graph"
                                                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800 ${categoryViewMode === 'bar'
                                                        ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-300'
                                                        : 'text-slate-600 hover:bg-white/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100'
                                                    }`}
                                            >
                                                <BarChart3 className="h-4 w-4" aria-hidden />
                                                <span className="hidden sm:inline">Bar</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setCategoryViewMode('pie')}
                                                aria-pressed={categoryViewMode === 'pie'}
                                                aria-label="Show category totals as pie chart"
                                                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800 ${categoryViewMode === 'pie'
                                                        ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-300'
                                                        : 'text-slate-600 hover:bg-white/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100'
                                                    }`}
                                            >
                                                <PieChart className="h-4 w-4" aria-hidden />
                                                <span className="hidden sm:inline">Pie</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {categoryViewMode === 'bar' && (
                                    <CategoryTotalsBarChart
                                        categoryTotals={categoryTotals}
                                        formatCurrency={formatCurrency}
                                        isDarkMode={isDarkMode}
                                    />
                                )}

                                {categoryViewMode === 'pie' && (
                                    <CategoryTotalsPieChart
                                        categoryTotals={categoryTotals}
                                        formatCurrency={formatCurrency}
                                        isDarkMode={isDarkMode}
                                    />
                                )}

                                <div className="mt-4 space-y-2">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                        Category Summary
                                    </p>
                                    <CategoryTotalsCards
                                        categoryTotals={categoryTotals}
                                        formatCurrency={formatCurrency}
                                    />
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
                        resultCount={filteredTransactions.length}
                    />

                    {/* Transactions */}
                    <TransactionList
                        transactions={paginatedTransactions}
                        fundId={fund.id}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        canEdit={canEdit}
                    />
                    <ClientPagination
                        totalItems={filteredTransactions.length}
                        perPage={perPage}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                        className="mt-4"
                    />
                </div>
            </div>

            {/* Add/Edit Transaction Modal */}
            <Modal show={showExportOptionsModal} onClose={closeExportOptions} maxWidth="xl">
                <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                                Export Transactions
                            </h3>
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                Select one or more categories to include in the DOCX export.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={closeExportOptions}
                            className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                            aria-label="Close export options"
                        >
                            <X className="h-4 w-4" aria-hidden />
                        </button>
                    </div>

                    <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-600 dark:bg-slate-700/30">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                {selectedExportCategories.length} of {exportCategoryOptions.length} selected
                            </p>
                            <div className="flex items-center gap-2">
                                <SecondaryButton
                                    type="button"
                                    onClick={() => setSelectedExportCategories(exportCategoryOptions)}
                                    disabled={exportCategoryOptions.length === 0}
                                >
                                    Select all
                                </SecondaryButton>
                                <SecondaryButton
                                    type="button"
                                    onClick={() => setSelectedExportCategories([])}
                                    disabled={selectedExportCategories.length === 0}
                                >
                                    Clear
                                </SecondaryButton>
                            </div>
                        </div>
                    </div>

                    {exportCategoryOptions.length > 0 ? (
                        <div className="mt-4 max-h-72 space-y-2 overflow-y-auto pr-1">
                            {exportCategoryOptions.map((category) => {
                                const isSelected = selectedExportCategories.includes(category);

                                return (
                                    <label
                                        key={category}
                                        className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5 transition hover:border-indigo-300 hover:bg-indigo-50/40 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-indigo-400/70 dark:hover:bg-indigo-500/10"
                                    >
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                            {category}
                                        </span>
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-500 dark:bg-slate-700"
                                            checked={isSelected}
                                            onChange={() => toggleExportCategory(category)}
                                        />
                                    </label>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-600 dark:bg-slate-700/20 dark:text-slate-300">
                            No categories found yet. You can still export all transactions.
                        </div>
                    )}

                    <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
                        <SecondaryButton type="button" onClick={closeExportOptions}>
                            Cancel
                        </SecondaryButton>
                        <SecondaryButton type="button" onClick={exportAllCategories}>
                            Export All
                        </SecondaryButton>
                        <PrimaryButton
                            type="button"
                            onClick={exportWithSelectedCategories}
                            disabled={selectedExportCategories.length === 0}
                        >
                            Export Selected
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>

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
