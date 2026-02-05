import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ClientPagination({
    totalItems,
    perPage,
    currentPage,
    onPageChange,
    className = '',
}) {
    const totalPages = Math.ceil(totalItems / perPage) || 1;

    if (totalItems <= perPage || totalPages <= 1) {
        return null;
    }

    const baseClasses =
        'relative inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium ring-1 ring-inset ring-gray-300 dark:ring-slate-600 transition min-w-[2.5rem]';
    const activeClasses =
        'z-10 bg-indigo-600 text-white ring-indigo-600 dark:bg-indigo-500 dark:ring-indigo-500';
    const hoverClasses =
        'hover:bg-gray-50 dark:hover:bg-slate-700 focus:z-20 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800';
    const disabledClasses =
        'cursor-default bg-gray-100 text-gray-400 dark:bg-slate-800 dark:text-slate-500';
    const defaultClasses =
        'bg-white text-gray-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700';

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        const end = Math.min(totalPages, start + maxVisible - 1);
        start = Math.max(1, end - maxVisible + 1);

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <nav
            role="navigation"
            aria-label="Pagination"
            className={`flex flex-wrap items-center justify-center gap-1 ${className}`}
        >
            <button
                type="button"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className={[
                    baseClasses,
                    currentPage <= 1 ? disabledClasses : `${defaultClasses} ${hoverClasses}`,
                ].join(' ')}
                aria-label="Previous page"
            >
                <ChevronLeft className="h-4 w-4" aria-hidden />
            </button>

            {pageNumbers[0] > 1 && (
                <>
                    <button
                        type="button"
                        onClick={() => onPageChange(1)}
                        className={`${baseClasses} ${defaultClasses} ${hoverClasses}`}
                    >
                        1
                    </button>
                    {pageNumbers[0] > 2 && (
                        <span className="px-2 py-2 text-gray-500 dark:text-slate-400">…</span>
                    )}
                </>
            )}

            {pageNumbers.map((page) => (
                <button
                    key={page}
                    type="button"
                    onClick={() => onPageChange(page)}
                    className={[
                        baseClasses,
                        page === currentPage ? activeClasses : `${defaultClasses} ${hoverClasses}`,
                    ].join(' ')}
                    aria-current={page === currentPage ? 'page' : undefined}
                >
                    {page}
                </button>
            ))}

            {pageNumbers[pageNumbers.length - 1] < totalPages && (
                <>
                    {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                        <span className="px-2 py-2 text-gray-500 dark:text-slate-400">…</span>
                    )}
                    <button
                        type="button"
                        onClick={() => onPageChange(totalPages)}
                        className={`${baseClasses} ${defaultClasses} ${hoverClasses}`}
                    >
                        {totalPages}
                    </button>
                </>
            )}

            <button
                type="button"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className={[
                    baseClasses,
                    currentPage >= totalPages ? disabledClasses : `${defaultClasses} ${hoverClasses}`,
                ].join(' ')}
                aria-label="Next page"
            >
                <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
        </nav>
    );
}
