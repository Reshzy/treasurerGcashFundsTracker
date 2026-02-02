import { Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            viewTransition
            {...props}
            className={
                'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-200 ease-out focus:outline-none ' +
                (active
                    ? 'border-accent-500 text-slate-900 focus:border-accent-600 dark:text-slate-100'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 focus:border-slate-300 focus:text-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-200') +
                className
            }
        >
            {children}
        </Link>
    );
}
