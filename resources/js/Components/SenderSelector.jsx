import { useState } from 'react';
import { Link } from '@inertiajs/react';
import TextInput from './TextInput';

export default function SenderSelector({ senders = [], value, onChange }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    const filteredSenders = senders.filter((sender) =>
        sender.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedSender = senders.find((s) => s.id.toString() === value?.toString());

    return (
        <div className="relative mt-1">
            <div className="flex gap-2">
                <div className="flex-1">
                    <TextInput
                        type="text"
                        value={selectedSender && !showDropdown ? selectedSender.name : searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setShowDropdown(true);
                            if (!e.target.value) {
                                onChange('');
                            }
                        }}
                        onFocus={() => {
                            setShowDropdown(true);
                            if (selectedSender) {
                                setSearchTerm('');
                            }
                        }}
                        placeholder={selectedSender ? selectedSender.name : "Search or select sender..."}
                        className="block w-full"
                    />
                </div>
                <Link
                    href={route('senders.create')}
                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                >
                    New
                </Link>
            </div>

            {showDropdown && filteredSenders.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-300 bg-white shadow-lg">
                    <ul className="max-h-60 overflow-auto py-1">
                        {filteredSenders.map((sender) => (
                            <li
                                key={sender.id}
                                onClick={() => {
                                    onChange(sender.id);
                                    setSearchTerm('');
                                    setShowDropdown(false);
                                }}
                                className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">{sender.name}</span>
                                    {sender.type === 'group' && (
                                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
                                            Group
                                        </span>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {showDropdown && searchTerm && filteredSenders.length === 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-300 bg-white p-4 text-sm text-gray-500 shadow-lg">
                    No senders found. Click "New" to create one.
                </div>
            )}
        </div>
    );
}
