import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ClientPagination from '@/Components/ClientPagination';
import UserFilters from '@/Components/UserFilters';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head, Link, router, usePage } from '@inertiajs/react';

function filterUsers(users, filters) {
    const {
        nameSearch = '',
        emailSearch = '',
        roleFilter = '',
        createdFrom = '',
        createdTo = '',
    } = filters;

    return users.filter((u) => {
        const nameMatch = !nameSearch.trim() || (u.name?.toLowerCase().includes(nameSearch.toLowerCase()));
        const emailMatch = !emailSearch.trim()
            || ((u.email ?? '').toLowerCase().includes(emailSearch.toLowerCase()));
        const roleMatch =
            !roleFilter ||
            (roleFilter === 'admin' && u.is_admin) ||
            (roleFilter === 'user' && !u.is_admin);
        const createdDate = String(u.created_at || '').slice(0, 10);
        const createdFromMatch = !createdFrom || createdDate >= createdFrom;
        const createdToMatch = !createdTo || createdDate <= createdTo;

        return nameMatch && emailMatch && roleMatch && createdFromMatch && createdToMatch;
    });
}

function sortUsers(users, sortBy, sortDir) {
    const dir = sortDir === 'desc' ? -1 : 1;
    return [...users].sort((a, b) => {
        let cmp = 0;
        if (sortBy === 'name') {
            cmp = (a.name ?? '').localeCompare(b.name ?? '');
        } else if (sortBy === 'email') {
            cmp = (a.email ?? '').localeCompare(b.email ?? '');
        } else if (sortBy === 'role') {
            cmp = (a.is_admin ? 1 : 0) - (b.is_admin ? 1 : 0);
        } else if (sortBy === 'created_at') {
            cmp = (a.created_at ?? '').localeCompare(b.created_at ?? '');
        }
        return cmp * dir;
    });
}

export default function Index({ users = [] }) {
    const currentUserId = usePage().props.auth?.user?.id;
    const [nameSearch, setNameSearch] = useState('');
    const [emailSearch, setEmailSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [createdFrom, setCreatedFrom] = useState('');
    const [createdTo, setCreatedTo] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortDir, setSortDir] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage] = useState(15);

    const allUsers = Array.isArray(users) ? users : [];
    const filteredUsers = filterUsers(allUsers, {
        nameSearch,
        emailSearch,
        roleFilter,
        createdFrom,
        createdTo,
    });
    const sortedUsers = sortUsers(filteredUsers, sortBy, sortDir);

    useEffect(() => {
        setCurrentPage(1);
    }, [
        nameSearch,
        emailSearch,
        roleFilter,
        createdFrom,
        createdTo,
        sortBy,
        sortDir,
    ]);

    const start = (currentPage - 1) * perPage;
    const paginatedUsers = sortedUsers.slice(start, start + perPage);

    const handleSort = (column) => {
        const newDir = sortBy === column && sortDir === 'asc' ? 'desc' : 'asc';
        setSortBy(column);
        setSortDir(newDir);
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

    const hasUsers = allUsers.length > 0;
    const hasFilteredResults = filteredUsers.length > 0;

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
                            onNameSearchChange={(v) => setNameSearch(v)}
                            emailSearch={emailSearch}
                            onEmailSearchChange={(v) => setEmailSearch(v)}
                            roleFilter={roleFilter}
                            onRoleFilterChange={(v) => setRoleFilter(v)}
                            createdFrom={createdFrom}
                            onCreatedFromChange={(v) => setCreatedFrom(v)}
                            createdTo={createdTo}
                            onCreatedToChange={(v) => setCreatedTo(v)}
                            onClear={clearFilters}
                            resultCount={filteredUsers.length}
                        />
                    )}
                    {!hasFilteredResults ? (
                        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-800">
                            <p className="text-lg text-gray-500 dark:text-slate-400">
                                {allUsers.length === 0 &&
                                !nameSearch &&
                                !emailSearch &&
                                !roleFilter &&
                                !createdFrom &&
                                !createdTo
                                    ? 'No users yet.'
                                    : 'No users match your filters.'}
                            </p>
                            {allUsers.length === 0 &&
                                !nameSearch &&
                                !emailSearch &&
                                !roleFilter &&
                                !createdFrom &&
                                !createdTo && (
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
                                        {paginatedUsers.map((user) => (
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
                            <ClientPagination
                                totalItems={filteredUsers.length}
                                perPage={perPage}
                                currentPage={currentPage}
                                onPageChange={setCurrentPage}
                                className="mt-4"
                            />
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
