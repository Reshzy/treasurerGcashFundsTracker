import { useEffect, useState } from 'react';
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
import { ArrowLeft, BarChart3, ChevronDown, ChevronUp, Download, LayoutGrid, PieChart } from 'lucide-react';
import axios from 'axios';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';

const selectClasses =
    'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100';

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

function CategoryTotalsBarChart({ categoryTotals, formatCurrency }) {
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
    const totals = normalizedData.map((item) => item.total);
    const maxValue = Math.max(...totals, 0);
    const minValue = Math.min(...totals, 0);
    const range = maxValue - minValue || 1;
    const width = 120;
    const height = 100;
    const paddingX = 8;
    const paddingY = 10;
    const plotWidth = width - (paddingX * 2);
    const plotHeight = height - (paddingY * 2);
    const zeroY = paddingY + (((maxValue - 0) / range) * plotHeight);
    const columnWidth = plotWidth / normalizedData.length;
    const barWidth = Math.max(Math.min(columnWidth * 0.64, 16), 6);

    const getY = (value) => {
        return paddingY + (((maxValue - value) / range) * plotHeight);
    };

    const bars = normalizedData.map((item, index) => {
        const centerX = paddingX + (columnWidth * index) + (columnWidth / 2);
        const y = getY(item.total);
        const barY = item.total >= 0 ? y : zeroY;
        const barHeight = Math.max(Math.abs(zeroY - y), item.total === 0 ? 1.2 : 1.6);

        return {
            ...item,
            x: centerX - (barWidth / 2),
            y: barY,
            height: barHeight,
        };
    });

    const [activeBarIndex, setActiveBarIndex] = useState(null);
    const activeBar = activeBarIndex !== null ? bars[activeBarIndex] : null;

    return (
        <div className="space-y-3">
            <div className="rounded-xl border border-slate-200/80 bg-white/70 p-4 dark:border-slate-600/80 dark:bg-slate-800/30">
                <div className="relative h-56 w-full">
                    <svg
                        viewBox={`0 0 ${width} ${height}`}
                        className="h-full w-full"
                        role="img"
                        aria-label="Bar chart of category totals"
                        preserveAspectRatio="none"
                    >
                        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                            const y = paddingY + (plotHeight * ratio);

                            return (
                                <line
                                    key={`grid-${ratio}`}
                                    x1={paddingX}
                                    x2={paddingX + plotWidth}
                                    y1={y}
                                    y2={y}
                                    stroke="rgb(148 163 184 / 0.24)"
                                    strokeDasharray="1.6 1.8"
                                    vectorEffect="non-scaling-stroke"
                                />
                            );
                        })}

                        <line
                            x1={paddingX}
                            x2={paddingX + plotWidth}
                            y1={zeroY}
                            y2={zeroY}
                            stroke="rgb(71 85 105 / 0.6)"
                            strokeWidth="1"
                            vectorEffect="non-scaling-stroke"
                        />

                        {bars.map((bar, index) => {
                            const isNegative = bar.total < 0;
                            const isActive = activeBarIndex === index;
                            const accessibleText = `${bar.category}: ${formatCurrency(bar.total)} from ${bar.transactionCount} transaction${bar.transactionCount === 1 ? '' : 's'}`;

                            return (
                                <rect
                                    key={`bar-${bar.category}-${index}`}
                                    x={bar.x}
                                    y={bar.y}
                                    width={barWidth}
                                    height={bar.height}
                                    rx="1.3"
                                    fill={isNegative ? 'rgb(248 113 113 / 0.86)' : 'rgb(79 70 229 / 0.86)'}
                                    stroke={isActive ? 'rgb(15 23 42 / 0.85)' : 'rgb(255 255 255 / 0.45)'}
                                    strokeWidth={isActive ? 1.4 : 0.5}
                                    className={`cursor-pointer transition-[filter,opacity,stroke-width] duration-150 focus:outline-none ${isActive ? 'opacity-100 [filter:brightness(1.08)]' : 'opacity-90 hover:opacity-100 hover:[filter:brightness(1.05)] focus:opacity-100'}`}
                                    onMouseEnter={() => setActiveBarIndex(index)}
                                    onMouseLeave={() => setActiveBarIndex(null)}
                                    onFocus={() => setActiveBarIndex(index)}
                                    onBlur={() => setActiveBarIndex(null)}
                                    tabIndex={0}
                                    role="img"
                                    aria-label={accessibleText}
                                >
                                    <title>{accessibleText}</title>
                                </rect>
                            );
                        })}
                    </svg>
                </div>

                <div
                    className="mt-3 min-h-12 rounded-lg border border-slate-200/80 bg-slate-50/80 px-3 py-2 text-sm text-slate-700 dark:border-slate-600/80 dark:bg-slate-700/30 dark:text-slate-200"
                    role="status"
                    aria-live="polite"
                >
                    {activeBar ? (
                        <p>
                            <span className="font-semibold">{activeBar.category}</span>
                            {' - '}
                            <span>{formatCurrency(activeBar.total)}</span>
                            {' '}
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                ({activeBar.transactionCount} txn{activeBar.transactionCount === 1 ? '' : 's'})
                            </span>
                        </p>
                    ) : (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Hover or focus a bar to view category totals.
                        </p>
                    )}
                </div>

                <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Min: {formatCurrency(minValue)}</span>
                    <span>Max: {formatCurrency(maxValue)}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {bars.map((item, index) => (
                    <div
                        key={`bar-item-${item.category}-${index}`}
                        className="flex items-center justify-between rounded-lg border border-slate-200/80 bg-slate-50 p-3 dark:border-slate-600/80 dark:bg-slate-700/30"
                    >
                        <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                            {item.category}
                        </p>
                        <div className="ml-3 text-right">
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                {formatCurrency(item.total)}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {item.transactionCount} txn{item.transactionCount === 1 ? '' : 's'}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function describePieArc(cx, cy, radius, startAngle, endAngle) {
    const startX = cx + (radius * Math.cos(startAngle));
    const startY = cy + (radius * Math.sin(startAngle));
    const endX = cx + (radius * Math.cos(endAngle));
    const endY = cy + (radius * Math.sin(endAngle));
    const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

    return `M ${cx} ${cy} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
}

function CategoryTotalsPieChart({ categoryTotals, formatCurrency }) {
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
    const positiveData = normalizedData.filter((item) => item.total > 0);
    const positiveTotal = positiveData.reduce((sum, item) => sum + item.total, 0);
    const piePalette = [
        'rgb(79 70 229 / 0.9)',
        'rgb(2 132 199 / 0.9)',
        'rgb(14 165 233 / 0.9)',
        'rgb(16 185 129 / 0.9)',
        'rgb(245 158 11 / 0.9)',
        'rgb(239 68 68 / 0.9)',
        'rgb(168 85 247 / 0.9)',
        'rgb(99 102 241 / 0.9)',
    ];

    let currentAngle = -Math.PI / 2;
    const slices = positiveData.map((item, index) => {
        const ratio = item.total / positiveTotal;
        const sweep = ratio * Math.PI * 2;
        const startAngle = currentAngle;
        const endAngle = currentAngle + sweep;
        currentAngle = endAngle;

        return {
            ...item,
            ratio,
            color: piePalette[index % piePalette.length],
            startAngle,
            endAngle,
        };
    });

    const [activeSliceIndex, setActiveSliceIndex] = useState(null);
    const activeSlice = activeSliceIndex !== null ? slices[activeSliceIndex] : null;

    return (
        <div className="space-y-3">
            <div className="rounded-xl border border-slate-200/80 bg-white/70 p-4 dark:border-slate-600/80 dark:bg-slate-800/30">
                {positiveTotal > 0 ? (
                    <div className="mx-auto h-56 w-full max-w-sm">
                        <svg
                            viewBox="0 0 120 120"
                            className="h-full w-full"
                            role="img"
                            aria-label="Pie chart of positive category totals"
                        >
                            {slices.length === 1 ? (
                                <circle
                                    cx="60"
                                    cy="60"
                                    r="42"
                                    fill={slices[0].color}
                                    stroke="white"
                                    strokeWidth="1.8"
                                    className="cursor-pointer transition-[filter] duration-150 hover:[filter:brightness(1.06)] focus:[filter:brightness(1.08)] focus:outline-none"
                                    tabIndex={0}
                                    role="img"
                                    aria-label={`${slices[0].category}: ${formatCurrency(slices[0].total)} (100%), ${slices[0].transactionCount} transaction${slices[0].transactionCount === 1 ? '' : 's'}`}
                                    onMouseEnter={() => setActiveSliceIndex(0)}
                                    onMouseLeave={() => setActiveSliceIndex(null)}
                                    onFocus={() => setActiveSliceIndex(0)}
                                    onBlur={() => setActiveSliceIndex(null)}
                                >
                                    <title>{`${slices[0].category}: ${formatCurrency(slices[0].total)} (100%)`}</title>
                                </circle>
                            ) : (
                                slices.map((slice, index) => {
                                    const isActive = activeSliceIndex === index;
                                    const accessibleText = `${slice.category}: ${formatCurrency(slice.total)} (${(slice.ratio * 100).toFixed(1)}%), ${slice.transactionCount} transaction${slice.transactionCount === 1 ? '' : 's'}`;

                                    return (
                                        <path
                                            key={`slice-${slice.category}-${index}`}
                                            d={describePieArc(60, 60, 42, slice.startAngle, slice.endAngle)}
                                            fill={slice.color}
                                            stroke={isActive ? 'rgb(15 23 42 / 0.85)' : 'white'}
                                            strokeWidth={isActive ? '2.4' : '1.8'}
                                            className="cursor-pointer transition-[filter,stroke-width] duration-150 hover:[filter:brightness(1.06)] focus:[filter:brightness(1.08)] focus:outline-none"
                                            tabIndex={0}
                                            role="img"
                                            aria-label={accessibleText}
                                            onMouseEnter={() => setActiveSliceIndex(index)}
                                            onMouseLeave={() => setActiveSliceIndex(null)}
                                            onFocus={() => setActiveSliceIndex(index)}
                                            onBlur={() => setActiveSliceIndex(null)}
                                        >
                                            <title>{accessibleText}</title>
                                        </path>
                                    );
                                })
                            )}
                            <circle cx="60" cy="60" r="20" fill="white" className="dark:fill-slate-800" />
                        </svg>
                    </div>
                ) : (
                    <div className="rounded-lg border border-dashed border-slate-300/80 bg-slate-50/60 p-6 text-center dark:border-slate-600 dark:bg-slate-800/30">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Pie chart requires at least one positive category total.
                        </p>
                    </div>
                )}

                {positiveTotal > 0 && (
                    <div
                        className="mt-3 min-h-12 rounded-lg border border-slate-200/80 bg-slate-50/80 px-3 py-2 text-sm text-slate-700 dark:border-slate-600/80 dark:bg-slate-700/30 dark:text-slate-200"
                        role="status"
                        aria-live="polite"
                    >
                        {activeSlice ? (
                            <p>
                                <span className="font-semibold">{activeSlice.category}</span>
                                {' - '}
                                <span>{formatCurrency(activeSlice.total)}</span>
                                {' '}
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                    ({(activeSlice.ratio * 100).toFixed(1)}%, {activeSlice.transactionCount} txn{activeSlice.transactionCount === 1 ? '' : 's'})
                                </span>
                            </p>
                        ) : (
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Hover or focus a pie slice to view category totals.
                            </p>
                        )}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {normalizedData.map((item, index) => {
                    const ratio = positiveTotal > 0 && item.total > 0 ? (item.total / positiveTotal) * 100 : null;

                    return (
                        <div
                            key={`pie-item-${item.category}-${index}`}
                            className="flex items-center justify-between rounded-lg border border-slate-200/80 bg-slate-50 p-3 dark:border-slate-600/80 dark:bg-slate-700/30"
                        >
                            <div className="flex min-w-0 items-center gap-2">
                                <span
                                    className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                                    style={{
                                        backgroundColor: item.total > 0
                                            ? piePalette[positiveData.findIndex((entry) => entry.category === item.category) % piePalette.length]
                                            : 'rgb(148 163 184 / 0.8)',
                                    }}
                                    aria-hidden
                                />
                                <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                                    {item.category}
                                </p>
                            </div>
                            <div className="ml-3 text-right">
                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                    {formatCurrency(item.total)}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {ratio !== null ? `${ratio.toFixed(1)}% of pie` : 'Excluded from pie'}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
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
    const [categoryViewMode, setCategoryViewMode] = useState('cards');
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage] = useState(12);

    const allTransactions = Array.isArray(transactions) ? transactions : [];
    const categoryTotals = Array.isArray(fund.category_totals) ? fund.category_totals : [];
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
                        <a
                            href={route('funds.transactions.export', fund.id)}
                            className="inline-flex items-center rounded-md border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-indigo-700 shadow-sm transition duration-150 ease-in-out hover:bg-indigo-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:border-indigo-500/60 dark:bg-indigo-500/20 dark:text-indigo-200 dark:hover:bg-indigo-500/30 dark:focus-visible:ring-offset-slate-800"
                        >
                            <Download className="mr-1.5 h-4 w-4" aria-hidden />
                            Export DOCX
                        </a>
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
                                            aria-label="Category breakdown view mode"
                                            className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-600 dark:bg-slate-700/40"
                                        >
                                            <button
                                                type="button"
                                                onClick={() => setCategoryViewMode('cards')}
                                                aria-pressed={categoryViewMode === 'cards'}
                                                aria-label="Show category totals as cards"
                                                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800 ${categoryViewMode === 'cards'
                                                        ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-300'
                                                        : 'text-slate-600 hover:bg-white/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100'
                                                    }`}
                                            >
                                                <LayoutGrid className="h-4 w-4" aria-hidden />
                                                <span className="hidden sm:inline">Cards</span>
                                            </button>
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

                                {categoryViewMode === 'cards' && (
                                    <CategoryTotalsCards
                                        categoryTotals={categoryTotals}
                                        formatCurrency={formatCurrency}
                                    />
                                )}

                                {categoryViewMode === 'bar' && (
                                    <CategoryTotalsBarChart
                                        categoryTotals={categoryTotals}
                                        formatCurrency={formatCurrency}
                                    />
                                )}

                                {categoryViewMode === 'pie' && (
                                    <CategoryTotalsPieChart
                                        categoryTotals={categoryTotals}
                                        formatCurrency={formatCurrency}
                                    />
                                )}
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
