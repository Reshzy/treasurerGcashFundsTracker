import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FundCard from '@/Components/FundCard';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head, Link } from '@inertiajs/react';

export default function Index({ funds }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Funds
                    </h2>
                    <Link href={route('funds.create')}>
                        <PrimaryButton>Create Fund</PrimaryButton>
                    </Link>
                </div>
            }
        >
            <Head title="Funds" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {funds.length === 0 ? (
                        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
                            <p className="text-lg text-gray-500">
                                No funds yet. Create your first fund to get started.
                            </p>
                            <Link href={route('funds.create')} className="mt-4 inline-block">
                                <PrimaryButton>Create Fund</PrimaryButton>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {funds.map((fund) => (
                                <FundCard key={fund.id} fund={fund} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
