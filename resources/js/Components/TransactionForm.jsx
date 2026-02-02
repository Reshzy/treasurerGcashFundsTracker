import { useForm } from '@inertiajs/react';
import InputLabel from './InputLabel';
import TextInput from './TextInput';
import InputError from './InputError';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';
import SenderSelector from './SenderSelector';

export default function TransactionForm({ fundId, senders = [], savedMemberNames = [], transaction = null, onCancel }) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        fund_id: fundId,
        sender_id: transaction?.sender_id || '',
        new_sender: null,
        amount: transaction?.amount || '',
        date: transaction?.date || new Date().toISOString().split('T')[0],
        notes: transaction?.notes || '',
        category: transaction?.category || '',
    });

    const submit = (e) => {
        e.preventDefault();
        
        if (transaction) {
            put(route('transactions.update', transaction.id), {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onCancel?.();
                },
            });
        } else {
            post(route('transactions.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onCancel?.();
                },
            });
        }
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <div>
                <InputLabel htmlFor="sender_id" value="Sender" />
                <SenderSelector
                    senders={senders}
                    savedMemberNames={savedMemberNames}
                    value={data.sender_id}
                    onChange={(value) => {
                        setData('sender_id', value);
                        setData('new_sender', null);
                    }}
                    onNewSenderChange={(newSender) => {
                        setData('new_sender', newSender);
                        setData('sender_id', '');
                    }}
                    errors={errors}
                />
                <InputError message={errors.sender_id || errors['new_sender.name'] || errors['new_sender.type'] || errors['new_sender.member_names']} className="mt-2" />
            </div>

            <div>
                <InputLabel htmlFor="amount" value="Amount" />
                <TextInput
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    name="amount"
                    value={data.amount}
                    className="mt-1 block w-full"
                    onChange={(e) => setData('amount', e.target.value)}
                />
                <InputError message={errors.amount} className="mt-2" />
            </div>

            <div>
                <InputLabel htmlFor="date" value="Date" />
                <TextInput
                    id="date"
                    type="date"
                    name="date"
                    value={data.date}
                    className="mt-1 block w-full"
                    onChange={(e) => setData('date', e.target.value)}
                />
                <InputError message={errors.date} className="mt-2" />
            </div>

            <div>
                <InputLabel htmlFor="category" value="Category (Optional)" />
                <TextInput
                    id="category"
                    type="text"
                    name="category"
                    value={data.category}
                    className="mt-1 block w-full"
                    onChange={(e) => setData('category', e.target.value)}
                />
                <InputError message={errors.category} className="mt-2" />
            </div>

            <div>
                <InputLabel htmlFor="notes" value="Notes (Optional)" />
                <textarea
                    id="notes"
                    name="notes"
                    value={data.notes}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows="3"
                    onChange={(e) => setData('notes', e.target.value)}
                />
                <InputError message={errors.notes} className="mt-2" />
            </div>

            <div className="flex items-center justify-end gap-4">
                {onCancel && (
                    <SecondaryButton type="button" onClick={onCancel}>
                        Cancel
                    </SecondaryButton>
                )}
                <PrimaryButton disabled={processing}>
                    {transaction ? 'Update Transaction' : 'Add Transaction'}
                </PrimaryButton>
            </div>
        </form>
    );
}
