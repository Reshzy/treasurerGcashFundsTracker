import { Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            viewTransition
            {...props}
            className={`flex w-full items-start border-l-4 py-2 pe-4 ps-3 ${
                active
                    ? 'border-accent-500 bg-accent-50 text-accent-800 focus:border-accent-600 focus:bg-accent-100 focus:text-accent-900 dark:bg-accent-900/30 dark:text-accent-300'
                    : 'border-transparent text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 focus:border-slate-300 focus:bg-slate-50 focus:text-slate-800 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200'
            } text-base font-medium transition duration-200 ease-out focus:outline-none ${className}`}
        >
            {children}
        </Link>
    );
}
