import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link } from '@inertiajs/react';

export default function Unauthorized() {
    return (
        <GuestLayout>
            <Head title="Unauthorized" />

            <div className="space-y-4 text-center">
                <h1 className="text-xl font-semibold text-gray-800">
                    Unauthorized
                </h1>
                <p className="text-sm text-gray-600">
                    Only administrators can use this system. Senders and other non-admin accounts do not have access.
                </p>
                <div className="pt-4">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                        Log out
                    </Link>
                </div>
            </div>
        </GuestLayout>
    );
}
