import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FundCard from '@/Components/FundCard';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({ funds, totalFunds, totalAmount }) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Summary Cards */}
                    <div className="mb-6 grid gap-6 sm:grid-cols-2">
                        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                            <div className="p-6">
                                <p className="text-sm font-medium text-gray-500">Total Funds</p>
                                <p className="mt-2 text-3xl font-bold text-gray-900">
                                    {totalFunds}
                                </p>
                            </div>
                        </div>
                        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                            <div className="p-6">
                                <p className="text-sm font-medium text-gray-500">Total Amount</p>
                                <p className="mt-2 text-3xl font-bold text-green-600">
                                    {formatCurrency(totalAmount)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mb-6 flex gap-4">
                        <Link href={route('funds.create')}>
                            <PrimaryButton>Create Fund</PrimaryButton>
                        </Link>
                        <Link href={route('senders.create')}>
                            <PrimaryButton>Create Sender</PrimaryButton>
                        </Link>
                        <Link href={route('funds.index')}>
                            <PrimaryButton>View All Funds</PrimaryButton>
                        </Link>
                    </div>

                    {/* Recent Funds */}
                    {funds.length > 0 ? (
                        <>
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">
                                Recent Funds
                            </h3>
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {funds.map((fund) => (
                                    <FundCard key={fund.id} fund={fund} />
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
                            <p className="text-lg text-gray-500">
                                No funds yet. Create your first fund to get started.
                            </p>
                            <Link href={route('funds.create')} className="mt-4 inline-block">
                                <PrimaryButton>Create Fund</PrimaryButton>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
