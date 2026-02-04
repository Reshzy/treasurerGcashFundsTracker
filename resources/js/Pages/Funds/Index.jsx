import { useCallback, useEffect, useRef, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FundCard from '@/Components/FundCard';
import FundFilters from '@/Components/FundFilters';
import Pagination from '@/Components/Pagination';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head, Link, router } from '@inertiajs/react';

function applyFilters(params) {
    const { page, ...rest } = params;
    router.get(
        route('funds.index'),
        Object.fromEntries(Object.entries(rest).filter(([, v]) => v != null && v !== '')),
        {
            preserveState: false,
            preserveScroll: true,
        },
    );
}

export default function Index({ funds, filters = {} }) {
    const [nameSearch, setNameSearch] = useState(filters.name ?? '');
    const [descriptionSearch, setDescriptionSearch] = useState(filters.description ?? '');
    const [totalMin, setTotalMin] = useState(filters.total_min ?? '');
    const [totalMax, setTotalMax] = useState(filters.total_max ?? '');
    const [transactionsMin, setTransactionsMin] = useState(filters.transactions_min ?? '');
    const [transactionsMax, setTransactionsMax] = useState(filters.transactions_max ?? '');
    const [createdFrom, setCreatedFrom] = useState(filters.created_from ?? '');
    const [createdTo, setCreatedTo] = useState(filters.created_to ?? '');
    const nameTimeoutRef = useRef(null);
    const descTimeoutRef = useRef(null);

    useEffect(() => {
        setNameSearch(filters.name ?? '');
        setDescriptionSearch(filters.description ?? '');
        setTotalMin(filters.total_min ?? '');
        setTotalMax(filters.total_max ?? '');
        setTransactionsMin(filters.transactions_min ?? '');
        setTransactionsMax(filters.transactions_max ?? '');
        setCreatedFrom(filters.created_from ?? '');
        setCreatedTo(filters.created_to ?? '');
    }, [
        filters.name,
        filters.description,
        filters.total_min,
        filters.total_max,
        filters.transactions_min,
        filters.transactions_max,
        filters.created_from,
        filters.created_to,
    ]);

    const handleNameChange = useCallback(
        (value) => {
            setNameSearch(value);
            if (nameTimeoutRef.current) clearTimeout(nameTimeoutRef.current);
            nameTimeoutRef.current = setTimeout(() => {
                applyFilters({ ...filters, name: value || undefined });
            }, 300);
        },
        [filters],
    );

    const handleDescriptionChange = useCallback(
        (value) => {
            setDescriptionSearch(value);
            if (descTimeoutRef.current) clearTimeout(descTimeoutRef.current);
            descTimeoutRef.current = setTimeout(() => {
                applyFilters({ ...filters, description: value || undefined });
            }, 300);
        },
        [filters],
    );

    useEffect(() => {
        return () => {
            if (nameTimeoutRef.current) clearTimeout(nameTimeoutRef.current);
            if (descTimeoutRef.current) clearTimeout(descTimeoutRef.current);
        };
    }, []);

    const clearFilters = () => {
        setNameSearch('');
        setDescriptionSearch('');
        setTotalMin('');
        setTotalMax('');
        setTransactionsMin('');
        setTransactionsMax('');
        setCreatedFrom('');
        setCreatedTo('');
        applyFilters({});
    };

    const handleFilterChange = (key, value) => {
        const setters = {
            total_min: setTotalMin,
            total_max: setTotalMax,
            transactions_min: setTransactionsMin,
            transactions_max: setTransactionsMax,
            created_from: setCreatedFrom,
            created_to: setCreatedTo,
        };
        setters[key]?.(value);
        applyFilters({ ...filters, [key]: value || undefined });
    };

    const fundList = funds?.data ?? funds ?? [];
    const total = funds?.total ?? fundList.length;
    const hasFunds = total > 0;

    const hasActiveFilters =
        filters.name ||
        filters.description ||
        filters.total_min ||
        filters.total_max ||
        filters.transactions_min ||
        filters.transactions_max ||
        filters.created_from ||
        filters.created_to;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-slate-200">
                        Funds
                    </h2>
                    <Link href={route('funds.create')}>
                        <PrimaryButton>Create Fund</PrimaryButton>
                    </Link>
                </div>
            }
        >
            <Head title="Funds" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {hasFunds && (
                        <FundFilters
                            nameSearch={nameSearch}
                            onNameSearchChange={(e) => handleNameChange(e.target.value)}
                            descriptionSearch={descriptionSearch}
                            onDescriptionSearchChange={(e) => handleDescriptionChange(e.target.value)}
                            totalMin={totalMin}
                            onTotalMinChange={(v) => handleFilterChange('total_min', v)}
                            totalMax={totalMax}
                            onTotalMaxChange={(v) => handleFilterChange('total_max', v)}
                            transactionsMin={transactionsMin}
                            onTransactionsMinChange={(v) => handleFilterChange('transactions_min', v)}
                            transactionsMax={transactionsMax}
                            onTransactionsMaxChange={(v) => handleFilterChange('transactions_max', v)}
                            createdFrom={createdFrom}
                            onCreatedFromChange={(v) => handleFilterChange('created_from', v)}
                            createdTo={createdTo}
                            onCreatedToChange={(v) => handleFilterChange('created_to', v)}
                            onClear={clearFilters}
                            resultCount={total}
                        />
                    )}
                    {fundList.length === 0 ? (
                        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-800">
                            <p className="text-lg text-gray-500 dark:text-slate-400">
                                {!hasActiveFilters
                                    ? 'No funds yet. Create your first fund to get started.'
                                    : 'No funds match your filters.'}
                            </p>
                            {!hasActiveFilters && (
                                <Link href={route('funds.create')} className="mt-4 inline-block">
                                    <PrimaryButton>Create Fund</PrimaryButton>
                                </Link>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {fundList.map((fund) => (
                                    <FundCard key={fund.id} fund={fund} />
                                ))}
                            </div>
                            {funds?.links && (
                                <div className="mt-6 flex justify-center">
                                    <Pagination links={funds.links} />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
