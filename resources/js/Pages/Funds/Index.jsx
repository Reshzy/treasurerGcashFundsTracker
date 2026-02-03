import { useMemo, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FundCard from '@/Components/FundCard';
import FundFilters from '@/Components/FundFilters';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head, Link } from '@inertiajs/react';

function filterFunds(
    funds,
    { nameSearch, descriptionSearch, totalMin, totalMax, transactionsMin, transactionsMax, createdFrom, createdTo },
) {
    return funds.filter((f) => {
        const name = (nameSearch || '').trim().toLowerCase();
        if (name && !(f.name || '').toLowerCase().includes(name)) return false;
        const desc = (descriptionSearch || '').trim().toLowerCase();
        if (desc && !(f.description || '').toLowerCase().includes(desc)) return false;
        const total = parseFloat(f.total);
        if (totalMin !== '' && !Number.isNaN(parseFloat(totalMin)) && total < parseFloat(totalMin))
            return false;
        if (totalMax !== '' && !Number.isNaN(parseFloat(totalMax)) && total > parseFloat(totalMax))
            return false;
        const txCount = parseInt(f.transaction_count, 10) || 0;
        if (
            transactionsMin !== '' &&
            !Number.isNaN(parseInt(transactionsMin, 10)) &&
            txCount < parseInt(transactionsMin, 10)
        )
            return false;
        if (
            transactionsMax !== '' &&
            !Number.isNaN(parseInt(transactionsMax, 10)) &&
            txCount > parseInt(transactionsMax, 10)
        )
            return false;
        const createdDate = f.created_at || '';
        if (createdFrom && createdDate < createdFrom) return false;
        if (createdTo && createdDate > createdTo) return false;
        return true;
    });
}

export default function Index({ funds }) {
    const [nameSearch, setNameSearch] = useState('');
    const [descriptionSearch, setDescriptionSearch] = useState('');
    const [totalMin, setTotalMin] = useState('');
    const [totalMax, setTotalMax] = useState('');
    const [transactionsMin, setTransactionsMin] = useState('');
    const [transactionsMax, setTransactionsMax] = useState('');
    const [createdFrom, setCreatedFrom] = useState('');
    const [createdTo, setCreatedTo] = useState('');

    const filteredFunds = useMemo(
        () =>
            filterFunds(funds, {
                nameSearch,
                descriptionSearch,
                totalMin,
                totalMax,
                transactionsMin,
                transactionsMax,
                createdFrom,
                createdTo,
            }),
        [funds, nameSearch, descriptionSearch, totalMin, totalMax, transactionsMin, transactionsMax, createdFrom, createdTo],
    );

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
                    {funds.length > 0 && (
                        <FundFilters
                            nameSearch={nameSearch}
                            onNameSearchChange={setNameSearch}
                            descriptionSearch={descriptionSearch}
                            onDescriptionSearchChange={setDescriptionSearch}
                            totalMin={totalMin}
                            onTotalMinChange={setTotalMin}
                            totalMax={totalMax}
                            onTotalMaxChange={setTotalMax}
                            transactionsMin={transactionsMin}
                            onTransactionsMinChange={setTransactionsMin}
                            transactionsMax={transactionsMax}
                            onTransactionsMaxChange={setTransactionsMax}
                            createdFrom={createdFrom}
                            onCreatedFromChange={setCreatedFrom}
                            createdTo={createdTo}
                            onCreatedToChange={setCreatedTo}
                            onClear={clearFilters}
                            resultCount={filteredFunds.length}
                        />
                    )}
                    {filteredFunds.length === 0 ? (
                        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-800">
                            <p className="text-lg text-gray-500 dark:text-slate-400">
                                {funds.length === 0
                                    ? 'No funds yet. Create your first fund to get started.'
                                    : 'No funds match your filters.'}
                            </p>
                            {funds.length === 0 && (
                                <Link href={route('funds.create')} className="mt-4 inline-block">
                                    <PrimaryButton>Create Fund</PrimaryButton>
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredFunds.map((fund) => (
                                <FundCard key={fund.id} fund={fund} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
