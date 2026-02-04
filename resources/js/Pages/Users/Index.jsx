import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import UserFilters from '@/Components/UserFilters';
import Pagination from '@/Components/Pagination';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head, Link, router, usePage } from '@inertiajs/react';

function applyFilters(params) {
    const { page, ...rest } = params;
    router.get(route('users.index'), Object.fromEntries(Object.entries(rest).filter(([, v]) => v != null && v !== '')), {
        preserveState: false,
        preserveScroll: true,
    });
}

export default function Index({ users, filters = {} }) {
    const currentUserId = usePage().props.auth?.user?.id;
    const [nameSearch, setNameSearch] = useState(filters.name ?? '');
    const [emailSearch, setEmailSearch] = useState(filters.email ?? '');
    const [roleFilter, setRoleFilter] = useState(filters.role ?? '');
    const [createdFrom, setCreatedFrom] = useState(filters.created_from ?? '');
    const [createdTo, setCreatedTo] = useState(filters.created_to ?? '');
    const nameTimeoutRef = useRef(null);
    const emailTimeoutRef = useRef(null);

    useEffect(() => {
        setNameSearch(filters.name ?? '');
        setEmailSearch(filters.email ?? '');
        setRoleFilter(filters.role ?? '');
        setCreatedFrom(filters.created_from ?? '');
        setCreatedTo(filters.created_to ?? '');
    }, [filters.name, filters.email, filters.role, filters.created_from, filters.created_to]);

    const sortBy = filters.sort ?? 'name';
    const sortDir = filters.dir ?? 'asc';

    const handleNameChange = useCallback(
        (value) => {
            setNameSearch(value);
            if (nameTimeoutRef.current) clearTimeout(nameTimeoutRef.current);
            nameTimeoutRef.current = setTimeout(() => {
                applyFilters({ ...filters, name: value || undefined, page: undefined });
            }, 300);
        },
        [filters],
    );

    const handleEmailChange = useCallback(
        (value) => {
            setEmailSearch(value);
            if (emailTimeoutRef.current) clearTimeout(emailTimeoutRef.current);
            emailTimeoutRef.current = setTimeout(() => {
                applyFilters({ ...filters, email: value || undefined, page: undefined });
            }, 300);
        },
        [filters],
    );

    useEffect(() => {
        return () => {
            if (nameTimeoutRef.current) clearTimeout(nameTimeoutRef.current);
            if (emailTimeoutRef.current) clearTimeout(emailTimeoutRef.current);
        };
    }, []);

    const handleSort = (column) => {
        const newDir = sortBy === column && sortDir === 'asc' ? 'desc' : 'asc';
        applyFilters({ ...filters, sort: column, dir: newDir, page: undefined });
    };

    const SortIcon = ({ column }) => {
        if (sortBy !== column) return <ArrowUpDown className="ml-1 inline h-3.5 w-3.5 opacity-50" aria-hidden />;
        return sortDir === 'asc' ? (
            <ArrowUp className="ml-1 inline h-3.5 w-3.5" aria-hidden />
        ) : (
            <ArrowDown className="ml-1 inline h-3.5 w-3.5" aria-hidden />
        );
    };

    const clearFilters = () => {
        setNameSearch('');
        setEmailSearch('');
        setRoleFilter('');
        setCreatedFrom('');
        setCreatedTo('');
        applyFilters({});
    };

    const handleRoleChange = (value) => {
        setRoleFilter(value);
        applyFilters({ ...filters, role: value || undefined, page: undefined });
    };

    const handleCreatedFromChange = (value) => {
        setCreatedFrom(value);
        applyFilters({ ...filters, created_from: value || undefined, page: undefined });
    };

    const handleCreatedToChange = (value) => {
        setCreatedTo(value);
        applyFilters({ ...filters, created_to: value || undefined, page: undefined });
    };

    const handleDelete = (user) => {
        if (user.id === currentUserId) {
            alert('You cannot delete your own account.');
            return;
        }
        if (confirm(`Are you sure you want to delete user "${user.name}"?`)) {
            router.delete(route('users.destroy', user.id));
        }
    };

    const userList = users?.data ?? users ?? [];
    const total = users?.total ?? userList.length;
    const hasUsers = total > 0;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-slate-200">
                        Users
                    </h2>
                    <Link href={route('users.create')}>
                        <PrimaryButton>Create User</PrimaryButton>
                    </Link>
                </div>
            }
        >
            <Head title="Users" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {hasUsers && (
                        <UserFilters
                            nameSearch={nameSearch}
                            onNameSearchChange={handleNameChange}
                            emailSearch={emailSearch}
                            onEmailSearchChange={handleEmailChange}
                            roleFilter={roleFilter}
                            onRoleFilterChange={handleRoleChange}
                            createdFrom={createdFrom}
                            onCreatedFromChange={handleCreatedFromChange}
                            createdTo={createdTo}
                            onCreatedToChange={handleCreatedToChange}
                            onClear={clearFilters}
                            resultCount={total}
                        />
                    )}
                    {userList.length === 0 ? (
                        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-800">
                            <p className="text-lg text-gray-500 dark:text-slate-400">
                                {total === 0 &&
                                !filters.name &&
                                !filters.email &&
                                !filters.role &&
                                !filters.created_from &&
                                !filters.created_to
                                    ? 'No users yet.'
                                    : 'No users match your filters.'}
                            </p>
                            {total === 0 &&
                                !filters.name &&
                                !filters.email &&
                                !filters.role &&
                                !filters.created_from &&
                                !filters.created_to && (
                                <Link href={route('users.create')} className="mt-4 inline-block">
                                    <PrimaryButton>Create User</PrimaryButton>
                                </Link>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                                    <thead className="bg-gray-50 dark:bg-slate-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-300">
                                                <button
                                                    type="button"
                                                    onClick={() => handleSort('name')}
                                                    className="inline-flex items-center hover:text-gray-700 dark:hover:text-slate-200"
                                                >
                                                    Name
                                                    <SortIcon column="name" />
                                                </button>
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-300">
                                                <button
                                                    type="button"
                                                    onClick={() => handleSort('email')}
                                                    className="inline-flex items-center hover:text-gray-700 dark:hover:text-slate-200"
                                                >
                                                    Email
                                                    <SortIcon column="email" />
                                                </button>
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-300">
                                                <button
                                                    type="button"
                                                    onClick={() => handleSort('role')}
                                                    className="inline-flex items-center hover:text-gray-700 dark:hover:text-slate-200"
                                                >
                                                    Role
                                                    <SortIcon column="role" />
                                                </button>
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-300">
                                                <button
                                                    type="button"
                                                    onClick={() => handleSort('created_at')}
                                                    className="inline-flex items-center hover:text-gray-700 dark:hover:text-slate-200"
                                                >
                                                    Created
                                                    <SortIcon column="created_at" />
                                                </button>
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-300">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white dark:divide-slate-700 dark:bg-slate-800">
                                        {userList.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-slate-300">
                                                    {user.name}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-slate-400">
                                                    {user.email ?? '-'}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                    {user.is_admin ? (
                                                        <span className="inline-flex rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                                                            Admin
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800 dark:bg-slate-700 dark:text-slate-300">
                                                            User
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-slate-400">
                                                    {user.created_at_formatted ?? user.created_at}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                                                    <Link
                                                        href={route('users.edit', user.id)}
                                                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <span className="mx-2 text-gray-300 dark:text-slate-600">|</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(user)}
                                                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {users?.links && (
                                <div className="mt-4 flex justify-center">
                                    <Pagination links={users.links} only={['users', 'filters']} />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
