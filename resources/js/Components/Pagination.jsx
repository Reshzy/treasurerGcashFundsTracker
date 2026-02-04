import { Link } from '@inertiajs/react';

export default function Pagination({ links = [], className = '', only }) {
    if (!links || links.length <= 1) {
        return null;
    }

    return (
        <nav
            role="navigation"
            aria-label="Pagination"
            className={`flex flex-wrap items-center justify-center gap-1 ${className}`}
        >
            {links.map((link, index) => {
                const isDisabled = link.url === null;
                const isActive = link.active;
                const isPrevious = String(link.label).includes('Previous');
                const isNext = String(link.label).includes('Next');

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

                const classes = [
                    baseClasses,
                    isActive ? activeClasses : isDisabled ? disabledClasses : `${defaultClasses} ${hoverClasses}`,
                ].join(' ');

                const content = (
                    <>
                        {isPrevious && <span className="sr-only">Previous</span>}
                        {isNext && <span className="sr-only">Next</span>}
                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                    </>
                );

                if (isDisabled) {
                    return (
                        <span key={index} className={classes} aria-disabled="true">
                            {content}
                        </span>
                    );
                }

                return (
                    <Link
                        key={index}
                        href={link.url}
                        className={classes}
                        preserveState
                        preserveScroll
                        {...(only?.length ? { only } : {})}
                    >
                        {content}
                    </Link>
                );
            })}
        </nav>
    );
}
