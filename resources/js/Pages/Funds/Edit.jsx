import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import axios from 'axios';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Head, useForm, router, usePage } from '@inertiajs/react';

const selectClasses =
    'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100';

export default function Edit({ fund, users = [] }) {
    const { data, setData, put, processing, errors } = useForm({
        name: fund.name || '',
        description: fund.description || '',
    });

    const addMemberForm = useForm({
        user_id: '',
        role: 'viewer',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('funds.update', fund.id));
    };

    const submitAddMember = (e) => {
        e.preventDefault();
        addMemberForm.post(route('funds.members.add', fund.id), {
            preserveScroll: true,
            onSuccess: () => addMemberForm.reset(),
        });
    };

    const removeMember = (userId) => {
        if (confirm('Are you sure you want to remove this member from the fund?')) {
            router.delete(route('funds.members.remove', [fund.id, userId]), {
                preserveScroll: true,
            });
        }
    };

    const initialHideAddMemberUi = usePage().props.auth?.user?.hide_add_member_ui ?? false;
    const [hideAddMemberUi, setHideAddMemberUiState] = useState(initialHideAddMemberUi);

    const setHideAddMemberUi = (hide) => {
        setHideAddMemberUiState(hide);
        axios.patch(route('profile.add-member-ui.update'), { hide }).catch(() => {
            setHideAddMemberUiState(!hide);
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-slate-200">
                    Edit Fund
                </h2>
            }
        >
            <Head title="Edit Fund" />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-slate-800 dark:shadow-slate-900/50">
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
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                                    rows="4"
                                    onChange={(e) => setData('description', e.target.value)}
                                />

                                <InputError message={errors.description} className="mt-2" />
                            </div>

                            <div className="mt-4">
                                <InputLabel value="Fund members" />
                                <div className="mt-2 flex flex-wrap items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 dark:border-slate-600 dark:bg-slate-700/50">
                                    {fund.members?.map((member) => (
                                        <span
                                            key={member.id}
                                            className="inline-flex items-center gap-1 rounded-full bg-gray-200 px-3 py-1 text-sm text-gray-700 dark:bg-slate-600 dark:text-slate-300"
                                        >
                                            {member.name}
                                            <span className="text-xs text-gray-500 dark:text-slate-400">
                                                ({member.role})
                                            </span>
                                            {member.role !== 'owner' && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeMember(member.id)}
                                                    className="ml-1 rounded p-0.5 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/40"
                                                    aria-label={`Remove ${member.name}`}
                                                >
                                                    ×
                                                </button>
                                            )}
                                        </span>
                                    ))}
                                    {users.length > 0 && (
                                        <SecondaryButton
                                            type="button"
                                            onClick={() => setHideAddMemberUi(!hideAddMemberUi)}
                                            className={
                                                hideAddMemberUi
                                                    ? '!border-indigo-300 !bg-indigo-50 !text-indigo-600 hover:!bg-indigo-100 dark:!border-indigo-600 dark:!bg-indigo-900/20 dark:!text-indigo-300 dark:hover:!bg-indigo-900/40'
                                                    : '!border-indigo-300 !bg-indigo-100 !text-indigo-700 ring-2 ring-indigo-500 ring-offset-2 hover:!bg-indigo-200 dark:!border-indigo-600 dark:!bg-indigo-900/40 dark:!text-indigo-200 dark:ring-offset-slate-800 dark:hover:!bg-indigo-900/60'
                                            }
                                        >
                                            {hideAddMemberUi ? (
                                                <>
                                                    <ChevronDown className="mr-1.5 h-4 w-4" aria-hidden />
                                                    Show add member
                                                </>
                                            ) : (
                                                <>
                                                    <ChevronUp className="mr-1.5 h-4 w-4" aria-hidden />
                                                    Hide add member
                                                </>
                                            )}
                                        </SecondaryButton>
                                    )}
                                </div>
                            </div>

                            {users.length > 0 && !hideAddMemberUi && (
                                <div className="mt-4 rounded-md border border-gray-200 bg-gray-50 p-4 dark:border-slate-600 dark:bg-slate-700/30">
                                    <InputLabel value="Add member" className="mb-2" />
                                    <form onSubmit={submitAddMember} className="flex flex-wrap items-end gap-4">
                                        <div className="min-w-0 flex-1 basis-40">
                                            <select
                                                id="add_member_user"
                                                value={addMemberForm.data.user_id}
                                                onChange={(e) => addMemberForm.setData('user_id', e.target.value)}
                                                className={selectClasses}
                                                required
                                            >
                                                <option value="">Select user...</option>
                                                {users.map((u) => (
                                                    <option key={u.id} value={u.id}>
                                                        {u.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError message={addMemberForm.errors.user_id} className="mt-1" />
                                        </div>
                                        <div className="min-w-0 basis-32">
                                            <select
                                                id="add_member_role"
                                                value={addMemberForm.data.role}
                                                onChange={(e) => addMemberForm.setData('role', e.target.value)}
                                                className={selectClasses}
                                            >
                                                <option value="viewer">View only</option>
                                                <option value="member">View & edit</option>
                                            </select>
                                            <InputError message={addMemberForm.errors.role} className="mt-1" />
                                        </div>
                                        <PrimaryButton type="submit" disabled={addMemberForm.processing}>
                                            Add
                                        </PrimaryButton>
                                    </form>
                                </div>
                            )}

                            <div className="mt-6 flex items-center justify-end gap-4">
                                <a
                                    href={route('funds.show', fund.id)}
                                    className="text-sm text-gray-600 underline hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200"
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
