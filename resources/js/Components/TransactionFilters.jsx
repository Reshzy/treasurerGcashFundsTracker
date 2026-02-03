import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import TextInput from './TextInput';
import InputLabel from './InputLabel';
import SecondaryButton from './SecondaryButton';

const STORAGE_KEY = 'transactionFiltersExpanded';

function getStoredExpanded() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored === 'true';
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

export default function TransactionFilters({
    senderSearch,
    onSenderSearchChange,
    notesSearch,
    onNotesSearchChange,
    categorySearch,
    onCategorySearchChange,
    dateFrom,
    onDateFromChange,
    dateTo,
    onDateToChange,
    createdFrom,
    onCreatedFromChange,
    createdTo,
    onCreatedToChange,
    amountMin,
    onAmountMinChange,
    amountMax,
    onAmountMaxChange,
    onClear,
    resultCount,
}) {
    const [showMoreFilters, setShowMoreFilters] = useState(getStoredExpanded);

    useEffect(() => {
        setStoredExpanded(showMoreFilters);
    }, [showMoreFilters]);

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

    const toggleMoreFilters = () => setShowMoreFilters((prev) => !prev);

    return (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="flex flex-wrap items-end gap-4">
                <div className="min-w-0 flex-[2] basis-80 sm:basis-96">
                    <InputLabel htmlFor="filter-sender" value="Sender / Group" />
                    <TextInput
                        id="filter-sender"
                        type="text"
                        value={senderSearch}
                        onChange={(e) => onSenderSearchChange(e.target.value)}
                        placeholder="Search by name..."
                        className="mt-1 block w-full"
                    />
                </div>
                <div className="min-w-0 flex-[2] basis-80 sm:basis-96">
                    <InputLabel htmlFor="filter-notes" value="Notes" />
                    <TextInput
                        id="filter-notes"
                        type="text"
                        value={notesSearch}
                        onChange={(e) => onNotesSearchChange(e.target.value)}
                        placeholder="Search in notes..."
                        className="mt-1 block w-full"
                    />
                </div>
                <div className="min-w-0 flex-1 basis-48 sm:basis-56">
                    <InputLabel htmlFor="filter-category" value="Category" />
                    <TextInput
                        id="filter-category"
                        type="text"
                        value={categorySearch}
                        onChange={(e) => onCategorySearchChange(e.target.value)}
                        placeholder="Search category..."
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
                        <InputLabel htmlFor="filter-date-from" value="Date from" />
                        <TextInput
                            id="filter-date-from"
                            type="date"
                            value={dateFrom}
                            onChange={(e) => onDateFromChange(e.target.value)}
                            className="mt-1 block w-full"
                        />
                    </div>
                    <div>
                        <InputLabel htmlFor="filter-date-to" value="Date to" />
                        <TextInput
                            id="filter-date-to"
                            type="date"
                            value={dateTo}
                            onChange={(e) => onDateToChange(e.target.value)}
                            className="mt-1 block w-full"
                        />
                    </div>
                    <div>
                        <InputLabel htmlFor="filter-created-from" value="Added from" />
                        <TextInput
                            id="filter-created-from"
                            type="date"
                            value={createdFrom}
                            onChange={(e) => onCreatedFromChange(e.target.value)}
                            className="mt-1 block w-full"
                        />
                    </div>
                    <div>
                        <InputLabel htmlFor="filter-created-to" value="Added to" />
                        <TextInput
                            id="filter-created-to"
                            type="date"
                            value={createdTo}
                            onChange={(e) => onCreatedToChange(e.target.value)}
                            className="mt-1 block w-full"
                        />
                    </div>
                    <div>
                        <InputLabel htmlFor="filter-amount-min" value="Amount min" />
                        <TextInput
                            id="filter-amount-min"
                            type="number"
                            step="0.01"
                            min="0"
                            value={amountMin}
                            onChange={(e) => onAmountMinChange(e.target.value)}
                            placeholder="0"
                            className="mt-1 block w-full"
                        />
                    </div>
                    <div>
                        <InputLabel htmlFor="filter-amount-max" value="Amount max" />
                        <TextInput
                            id="filter-amount-max"
                            type="number"
                            step="0.01"
                            min="0"
                            value={amountMax}
                            onChange={(e) => onAmountMaxChange(e.target.value)}
                            placeholder="Any"
                            className="mt-1 block w-full"
                        />
                    </div>
                </div>
            )}
            {resultCount !== null && (
                <p className="mt-3 text-sm text-gray-500 dark:text-slate-400">
                    Showing {resultCount} transaction{resultCount !== 1 ? 's' : ''}
                </p>
            )}
        </div>
    );
}
