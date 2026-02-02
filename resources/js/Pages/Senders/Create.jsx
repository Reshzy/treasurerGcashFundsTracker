import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import Checkbox from '@/Components/Checkbox';
import { Head, useForm, usePage } from '@inertiajs/react';

export default function Create() {
    const { users } = usePage().props;
    const [senderType, setSenderType] = useState('individual');

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        type: 'individual',
        member_ids: [],
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('senders.store'));
    };

    const handleTypeChange = (type) => {
        setSenderType(type);
        setData('type', type);
        if (type === 'individual') {
            setData('member_ids', []);
        }
    };

    const toggleMember = (userId) => {
        const currentIds = data.member_ids || [];
        if (currentIds.includes(userId)) {
            setData(
                'member_ids',
                currentIds.filter((id) => id !== userId)
            );
        } else {
            setData('member_ids', [...currentIds, userId]);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-slate-200">
                    Create Sender
                </h2>
            }
        >
            <Head title="Create Sender" />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-slate-800 dark:shadow-slate-900/50">
                        <form onSubmit={submit} className="p-6">
                            <div>
                                <InputLabel htmlFor="name" value="Sender Name" />

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
                                <InputLabel value="Type" />
                                <div className="mt-2 flex gap-4">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="type"
                                            value="individual"
                                            checked={senderType === 'individual'}
                                            onChange={() => handleTypeChange('individual')}
                                            className="mr-2"
                                        />
                                        <span>Individual</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="type"
                                            value="group"
                                            checked={senderType === 'group'}
                                            onChange={() => handleTypeChange('group')}
                                            className="mr-2"
                                        />
                                        <span>Group</span>
                                    </label>
                                </div>
                                <InputError message={errors.type} className="mt-2" />
                            </div>

                            {senderType === 'group' && (
                                <div className="mt-4">
                                    <InputLabel value="Select Members" />
                                    <div className="mt-2 max-h-60 overflow-y-auto rounded-md border border-gray-300 p-4">
                                        {users && users.length > 0 ? (
                                            users.map((user) => (
                                                <label
                                                    key={user.id}
                                                    className="flex items-center py-2"
                                                >
                                                    <Checkbox
                                                        checked={data.member_ids?.includes(user.id)}
                                                        onChange={() => toggleMember(user.id)}
                                                    />
                                                    <span className="ml-2 text-sm text-gray-700">
                                                        {user.name}
                                                    </span>
                                                </label>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500">
                                                No users available
                                            </p>
                                        )}
                                    </div>
                                    <InputError message={errors.member_ids} className="mt-2" />
                                </div>
                            )}

                            <div className="mt-6 flex items-center justify-end gap-4">
                                <a
                                    href={route('senders.index')}
                                    className="text-sm text-gray-600 underline hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200"
                                >
                                    Cancel
                                </a>
                                <PrimaryButton disabled={processing}>
                                    Create Sender
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
