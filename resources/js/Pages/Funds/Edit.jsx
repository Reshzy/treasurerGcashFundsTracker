import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { Head, useForm } from '@inertiajs/react';

export default function Edit({ fund }) {
    const { data, setData, put, processing, errors } = useForm({
        name: fund.name || '',
        description: fund.description || '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('funds.update', fund.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Edit Fund
                </h2>
            }
        >
            <Head title="Edit Fund" />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="p-6">
                            <div>
                                <InputLabel htmlFor="name" value="Fund Name" />

                                <TextInput
                                    id="name"
                                    type="text"
                                    name="name"
                                    value={data.name}
                                    className="mt-1 block w-full"
                                    isFocused={true}
                                    onChange={(e) => setData('name', e.target.value)}
                                />

                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div className="mt-4">
                                <InputLabel htmlFor="description" value="Description" />

                                <textarea
                                    id="description"
                                    name="description"
                                    value={data.description}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    rows="4"
                                    onChange={(e) => setData('description', e.target.value)}
                                />

                                <InputError message={errors.description} className="mt-2" />
                            </div>

                            {fund.members?.length > 0 && (
                                <div className="mt-4">
                                    <InputLabel value="Fund members" />
                                    <div className="mt-2 flex flex-wrap gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
                                        {fund.members.map((member) => (
                                            <span
                                                key={member.id}
                                                className="inline-flex items-center rounded-full bg-gray-200 px-3 py-1 text-sm text-gray-700"
                                            >
                                                {member.name}
                                                <span className="ml-2 text-xs text-gray-500">
                                                    ({member.role})
                                                </span>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mt-6 flex items-center justify-end gap-4">
                                <a
                                    href={route('funds.show', fund.id)}
                                    className="text-sm text-gray-600 underline hover:text-gray-900"
                                >
                                    Cancel
                                </a>
                                <PrimaryButton disabled={processing}>
                                    Update Fund
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
