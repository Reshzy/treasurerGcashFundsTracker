import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head, Link } from '@inertiajs/react';

export default function Index({ senders }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-slate-200">
                        Senders
                    </h2>
                    <Link href={route('senders.create')}>
                        <PrimaryButton>Create Sender</PrimaryButton>
                    </Link>
                </div>
            }
        >
            <Head title="Senders" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {senders.length === 0 ? (
                        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-800">
                            <p className="text-lg text-gray-500 dark:text-slate-400">
                                No senders yet. Create your first sender to get started.
                            </p>
                            <Link href={route('senders.create')} className="mt-4 inline-block">
                                <PrimaryButton>Create Sender</PrimaryButton>
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
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-300">
                                            Members
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-300">
                                            Created By
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-300">
                                            Created
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white dark:divide-slate-700 dark:bg-slate-800">
                                    {senders.map((sender) => (
                                        <tr key={sender.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-slate-300">
                                                {sender.name}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                <span
                                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                                        sender.type === 'group'
                                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                                                            : 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-300'
                                                    }`}
                                                >
                                                    {sender.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400">
                                                {sender.members.length > 0
                                                    ? sender.members.join(', ')
                                                    : '-'}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-slate-400">
                                                {sender.creator}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-slate-400">
                                                {sender.created_at_formatted ?? sender.created_at}
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
