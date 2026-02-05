import { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ClientPagination from '@/Components/ClientPagination';
import FundCard from '@/Components/FundCard';
import FundFilters from '@/Components/FundFilters';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head, Link } from '@inertiajs/react';

function filterFunds(funds, filters) {
    const {
        nameSearch = '',
        descriptionSearch = '',
        totalMin = '',
        totalMax = '',
        transactionsMin = '',
        transactionsMax = '',
        createdFrom = '',
        createdTo = '',
    } = filters;

    return funds.filter((f) => {
        const nameMatch = !nameSearch.trim() || (f.name?.toLowerCase().includes(nameSearch.toLowerCase()));
        const descMatch =
            !descriptionSearch.trim() ||
            ((f.description ?? '').toLowerCase().includes(descriptionSearch.toLowerCase()));
        const totalMinMatch = totalMin === '' || Number(f.total) >= Number(totalMin);
        const totalMaxMatch = totalMax === '' || Number(f.total) <= Number(totalMax);
        const transMinMatch =
            transactionsMin === '' || (f.transaction_count ?? 0) >= Number(transactionsMin);
        const transMaxMatch =
            transactionsMax === '' || (f.transaction_count ?? 0) <= Number(transactionsMax);
        const createdDate = String(f.created_at || '').slice(0, 10);
        const createdFromMatch = !createdFrom || createdDate >= createdFrom;
        const createdToMatch = !createdTo || createdDate <= createdTo;

        return (
            nameMatch &&
            descMatch &&
            totalMinMatch &&
            totalMaxMatch &&
            transMinMatch &&
            transMaxMatch &&
            createdFromMatch &&
            createdToMatch
        );
    });
}

export default function Index({ funds = [] }) {
    const [nameSearch, setNameSearch] = useState('');
    const [descriptionSearch, setDescriptionSearch] = useState('');
    const [totalMin, setTotalMin] = useState('');
    const [totalMax, setTotalMax] = useState('');
    const [transactionsMin, setTransactionsMin] = useState('');
    const [transactionsMax, setTransactionsMax] = useState('');
    const [createdFrom, setCreatedFrom] = useState('');
    const [createdTo, setCreatedTo] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage] = useState(15);

    const allFunds = Array.isArray(funds) ? funds : [];
    const filteredFunds = filterFunds(allFunds, {
        nameSearch,
        descriptionSearch,
        totalMin,
        totalMax,
        transactionsMin,
        transactionsMax,
        createdFrom,
        createdTo,
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [
        nameSearch,
        descriptionSearch,
        totalMin,
        totalMax,
        transactionsMin,
        transactionsMax,
        createdFrom,
        createdTo,
    ]);

    const start = (currentPage - 1) * perPage;
    const paginatedFunds = filteredFunds.slice(start, start + perPage);

    const clearFilters = () => {
        setNameSearch('');
        setDescriptionSearch('');
        setTotalMin('');
        setTotalMax('');
        setTransactionsMin('');
        setTransactionsMax('');
        setCreatedFrom('');
        setCreatedTo('');
    };

    const hasActiveFilters =
        nameSearch ||
        descriptionSearch ||
        totalMin ||
        totalMax ||
        transactionsMin ||
        transactionsMax ||
        createdFrom ||
        createdTo;

    const hasFilteredResults = filteredFunds.length > 0;

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
                    {allFunds.length > 0 && (
                        <FundFilters
                            nameSearch={nameSearch}
                            onNameSearchChange={(v) => setNameSearch(v)}
                            descriptionSearch={descriptionSearch}
                            onDescriptionSearchChange={(v) => setDescriptionSearch(v)}
                            totalMin={totalMin}
                            onTotalMinChange={(v) => setTotalMin(v)}
                            totalMax={totalMax}
                            onTotalMaxChange={(v) => setTotalMax(v)}
                            transactionsMin={transactionsMin}
                            onTransactionsMinChange={(v) => setTransactionsMin(v)}
                            transactionsMax={transactionsMax}
                            onTransactionsMaxChange={(v) => setTransactionsMax(v)}
                            createdFrom={createdFrom}
                            onCreatedFromChange={(v) => setCreatedFrom(v)}
                            createdTo={createdTo}
                            onCreatedToChange={(v) => setCreatedTo(v)}
                            onClear={clearFilters}
                            resultCount={filteredFunds.length}
                        />
                    )}
                    {!hasFilteredResults ? (
                        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-800">
                            <p className="text-lg text-gray-500 dark:text-slate-400">
                                {allFunds.length === 0 && !hasActiveFilters
                                    ? 'No funds yet. Create your first fund to get started.'
                                    : 'No funds match your filters.'}
                            </p>
                            {allFunds.length === 0 && !hasActiveFilters && (
                                    <Link href={route('funds.create')} className="mt-4 inline-block">
                                        <PrimaryButton>Create Fund</PrimaryButton>
                                    </Link>
                                )}
                        </div>
                    ) : (
                        <>
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {paginatedFunds.map((fund) => (
                                    <FundCard key={fund.id} fund={fund} />
                                ))}
                            </div>
                            <ClientPagination
                                totalItems={filteredFunds.length}
                                perPage={perPage}
                                currentPage={currentPage}
                                onPageChange={setCurrentPage}
                                className="mt-6"
                            />
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
