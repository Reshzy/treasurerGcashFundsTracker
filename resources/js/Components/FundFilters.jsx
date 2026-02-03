import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import TextInput from './TextInput';
import InputLabel from './InputLabel';
import SecondaryButton from './SecondaryButton';

const STORAGE_KEY = 'fundFiltersExpanded';

function getStoredExpanded() {
    try {
        return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
        return false;
    }
}

function setStoredExpanded(value) {
    try {
        localStorage.setItem(STORAGE_KEY, String(value));
    } catch {
        // ignore
    }
}

export default function FundFilters({
    nameSearch,
    onNameSearchChange,
    descriptionSearch,
    onDescriptionSearchChange,
    totalMin,
    onTotalMinChange,
    totalMax,
    onTotalMaxChange,
    transactionsMin,
    onTransactionsMinChange,
    transactionsMax,
    onTransactionsMaxChange,
    createdFrom,
    onCreatedFromChange,
    createdTo,
    onCreatedToChange,
    onClear,
    resultCount,
}) {
    const [showMoreFilters, setShowMoreFilters] = useState(getStoredExpanded);

    useEffect(() => {
        setStoredExpanded(showMoreFilters);
    }, [showMoreFilters]);

    const hasActiveFilters =
        nameSearch ||
        descriptionSearch ||
        totalMin ||
        totalMax ||
        transactionsMin ||
        transactionsMax ||
        createdFrom ||
        createdTo;

    const toggleMoreFilters = () => setShowMoreFilters((prev) => !prev);

    return (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="flex flex-wrap items-end gap-4">
                <div className="min-w-0 flex-[2] basis-64 sm:basis-80">
                    <InputLabel htmlFor="filter-name" value="Name" />
                    <TextInput
                        id="filter-name"
                        type="text"
                        value={nameSearch}
                        onChange={(e) => onNameSearchChange(e.target.value)}
                        placeholder="Search by name..."
                        className="mt-1 block w-full"
                    />
                </div>
                <div className="min-w-0 flex-[2] basis-64 sm:basis-80">
                    <InputLabel htmlFor="filter-description" value="Description" />
                    <TextInput
                        id="filter-description"
                        type="text"
                        value={descriptionSearch}
                        onChange={(e) => onDescriptionSearchChange(e.target.value)}
                        placeholder="Search in description..."
                        className="mt-1 block w-full"
                    />
                </div>
                <div className="flex items-end gap-2">
                    <SecondaryButton
                        type="button"
                        onClick={toggleMoreFilters}
                        className={
                            showMoreFilters
                                ? '!border-indigo-300 !bg-indigo-100 !text-indigo-700 ring-2 ring-indigo-500 ring-offset-2 hover:!bg-indigo-200 dark:!border-indigo-600 dark:!bg-indigo-900/40 dark:!text-indigo-200 dark:ring-offset-slate-800 dark:hover:!bg-indigo-900/60'
                                : '!border-indigo-300 !bg-indigo-50 !text-indigo-600 hover:!bg-indigo-100 dark:!border-indigo-600 dark:!bg-indigo-900/20 dark:!text-indigo-300 dark:hover:!bg-indigo-900/40'
                        }
                    >
                        {showMoreFilters ? (
                            <>
                                <ChevronUp className="mr-1.5 h-4 w-4" aria-hidden />
                                Less filters
                            </>
                        ) : (
                            <>
                                <ChevronDown className="mr-1.5 h-4 w-4" aria-hidden />
                                More filters
                            </>
                        )}
                    </SecondaryButton>
                    {hasActiveFilters && (
                        <SecondaryButton
                            type="button"
                            onClick={onClear}
                            className="!border-amber-300 !bg-amber-50 !text-amber-700 hover:!bg-amber-100 dark:!border-amber-600 dark:!bg-amber-900/30 dark:!text-amber-300 dark:hover:!bg-amber-900/50"
                        >
                            <X className="mr-1.5 h-4 w-4" aria-hidden />
                            Clear filters
                        </SecondaryButton>
                    )}
                </div>
            </div>

            {showMoreFilters && (
                <div className="mt-4 flex flex-wrap items-end gap-4 border-t border-gray-200 pt-4 dark:border-slate-600">
                    <div>
                        <InputLabel htmlFor="filter-total-min" value="Total min" />
                        <TextInput
                            id="filter-total-min"
                            type="number"
                            step="0.01"
                            min="0"
                            value={totalMin}
                            onChange={(e) => onTotalMinChange(e.target.value)}
                            placeholder="0"
                            className="mt-1 block w-full"
                        />
                    </div>
                    <div>
                        <InputLabel htmlFor="filter-total-max" value="Total max" />
                        <TextInput
                            id="filter-total-max"
                            type="number"
                            step="0.01"
                            min="0"
                            value={totalMax}
                            onChange={(e) => onTotalMaxChange(e.target.value)}
                            placeholder="Any"
                            className="mt-1 block w-full"
                        />
                    </div>
                    <div>
                        <InputLabel htmlFor="filter-transactions-min" value="Transactions min" />
                        <TextInput
                            id="filter-transactions-min"
                            type="number"
                            min="0"
                            value={transactionsMin}
                            onChange={(e) => onTransactionsMinChange(e.target.value)}
                            placeholder="0"
                            className="mt-1 block w-full"
                        />
                    </div>
                    <div>
                        <InputLabel htmlFor="filter-transactions-max" value="Transactions max" />
                        <TextInput
                            id="filter-transactions-max"
                            type="number"
                            min="0"
                            value={transactionsMax}
                            onChange={(e) => onTransactionsMaxChange(e.target.value)}
                            placeholder="Any"
                            className="mt-1 block w-full"
                        />
                    </div>
                    <div>
                        <InputLabel htmlFor="filter-created-from" value="Created from" />
                        <TextInput
                            id="filter-created-from"
                            type="date"
                            value={createdFrom}
                            onChange={(e) => onCreatedFromChange(e.target.value)}
                            className="mt-1 block w-full"
                        />
                    </div>
                    <div>
                        <InputLabel htmlFor="filter-created-to" value="Created to" />
                        <TextInput
                            id="filter-created-to"
                            type="date"
                            value={createdTo}
                            onChange={(e) => onCreatedToChange(e.target.value)}
                            className="mt-1 block w-full"
                        />
                    </div>
                </div>
            )}

            {resultCount !== null && (
                <p className="mt-3 text-sm text-gray-500 dark:text-slate-400">
                    Showing {resultCount} fund{resultCount !== 1 ? 's' : ''}
                </p>
            )}
        </div>
    );
}
