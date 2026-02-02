import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head, Link, router, usePage } from '@inertiajs/react';

export default function Index({ users }) {
    const currentUserId = usePage().props.auth?.user?.id;

    const handleDelete = (user) => {
        if (user.id === currentUserId) {
            alert('You cannot delete your own account.');
            return;
        }
        if (confirm(`Are you sure you want to delete user "${user.name}"?`)) {
            router.delete(route('users.destroy', user.id));
        }
    };

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
                    {users.length === 0 ? (
                        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-800">
                            <p className="text-lg text-gray-500 dark:text-slate-400">
                                No users yet.
                            </p>
                            <Link href={route('users.create')} className="mt-4 inline-block">
                                <PrimaryButton>Create User</PrimaryButton>
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                                <thead className="bg-gray-50 dark:bg-slate-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-300">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-300">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-300">
                                            Role
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-300">
                                            Created
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-300">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white dark:divide-slate-700 dark:bg-slate-800">
                                    {users.map((user) => (
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
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
