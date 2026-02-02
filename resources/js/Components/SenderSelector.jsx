import { useState, useEffect } from 'react';
import TextInput from './TextInput';
import InputLabel from './InputLabel';
import PrimaryButton from './PrimaryButton';

const isEditOnlyMode = (allowEditSender, senderForEdit) =>
    allowEditSender && senderForEdit && senderForEdit.can_edit;

export default function SenderSelector({ senders = [], savedMemberNames = [], value, onChange, onNewSenderChange, onEditSenderChange, errors = {}, allowEditSender = false, senderForEdit = null }) {
    const editOnly = isEditOnlyMode(allowEditSender, senderForEdit);
    const [mode, setMode] = useState(() =>
        editOnly ? 'edit' : (value ? 'select' : 'select')
    );
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [senderType, setSenderType] = useState(() =>
        editOnly ? (senderForEdit?.type ?? 'individual') : 'individual'
    );
    const [newSenderName, setNewSenderName] = useState(() =>
        editOnly ? (senderForEdit?.name ?? '') : ''
    );
    const [memberNames, setMemberNames] = useState(() =>
        editOnly && senderForEdit?.type === 'group' && senderForEdit?.members?.length
            ? [...senderForEdit.members]
            : ['']
    );

    const filteredSenders = senders.filter((sender) =>
        sender.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedSender = senders.find((s) => s.id.toString() === value?.toString()) ?? (senderForEdit && value?.toString() === senderForEdit.id?.toString() ? senderForEdit : null);

    const showEditSenderOption = allowEditSender && senderForEdit && value?.toString() === senderForEdit.id?.toString() && senderForEdit.can_edit;

    // Sync state and parent form data when entering edit-only mode (e.g. opening Edit Transaction)
    useEffect(() => {
        if (!editOnly) return;
        setMode('edit');
        setNewSenderName(senderForEdit?.name ?? '');
        setSenderType(senderForEdit?.type ?? 'individual');
        setMemberNames(
            senderForEdit?.type === 'group' && senderForEdit?.members?.length
                ? [...senderForEdit.members]
                : ['']
        );
        const payload = {
            name: senderForEdit?.name ?? '',
            type: senderForEdit?.type ?? 'individual',
        };
        if (senderForEdit?.type === 'group' && senderForEdit?.members?.length) {
            payload.member_names = senderForEdit.members;
        }
        onEditSenderChange?.(payload);
    }, [allowEditSender, senderForEdit?.id]); // run when we switch to editing a transaction

    const handleModeChange = (newMode) => {
        setMode(newMode);
        if (newMode === 'select') {
            onChange(value);
            onNewSenderChange?.(null);
            onEditSenderChange?.(null);
        } else if (newMode === 'create') {
            onChange('');
            setNewSenderName('');
            setMemberNames(['']);
            setSenderType('individual');
            onNewSenderChange(null);
            onEditSenderChange?.(null);
        } else if (newMode === 'edit' && senderForEdit) {
            setNewSenderName(senderForEdit.name ?? '');
            setSenderType(senderForEdit.type ?? 'individual');
            setMemberNames(senderForEdit.type === 'group' && senderForEdit.members?.length ? [...senderForEdit.members] : ['']);
            const payload = {
                name: senderForEdit.name ?? '',
                type: senderForEdit.type ?? 'individual',
            };
            if (senderForEdit.type === 'group' && senderForEdit.members?.length) {
                payload.member_names = senderForEdit.members;
            }
            onEditSenderChange?.(payload);
        }
    };

    const handleSelectSender = (senderId) => {
        onChange(senderId);
        setSearchTerm('');
        setShowDropdown(false);
        onNewSenderChange(null);
        onEditSenderChange?.(null);
    };

    const handleAddMember = () => {
        const updated = [...memberNames, ''];
        setMemberNames(updated);
        // Don't update parent yet since new member name is empty
    };

    const notifySenderChange = (payload) => {
        if (mode === 'edit') {
            onEditSenderChange?.(payload);
        } else {
            onNewSenderChange(payload);
        }
    };

    const handleRemoveMember = (index) => {
        const updated = memberNames.filter((_, i) => i !== index);
        setMemberNames(updated);
        setTimeout(() => {
            const validMembers = updated.filter(n => n.trim());
            if (newSenderName.trim() && validMembers.length > 0) {
                notifySenderChange({
                    name: newSenderName.trim(),
                    type: 'group',
                    member_names: validMembers.map(n => n.trim()),
                });
            } else {
                notifySenderChange(null);
            }
        }, 0);
    };

    const handleMemberNameChange = (index, name) => {
        const updated = [...memberNames];
        updated[index] = name;
        setMemberNames(updated);
        setTimeout(() => {
            const validMembers = updated.filter(n => n.trim());
            if (newSenderName.trim() && validMembers.length > 0) {
                notifySenderChange({
                    name: newSenderName.trim(),
                    type: 'group',
                    member_names: validMembers.map(n => n.trim()),
                });
            } else {
                notifySenderChange(null);
            }
        }, 0);
    };

    const handleAddSavedName = (name) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        const currentTrimmed = memberNames.map((n) => n.trim()).filter(Boolean);
        if (currentTrimmed.includes(trimmed)) return;
        let newMemberNames;
        const emptyIdx = memberNames.findIndex((n) => !n.trim());
        if (emptyIdx >= 0) {
            newMemberNames = [...memberNames];
            newMemberNames[emptyIdx] = trimmed;
        } else {
            newMemberNames = [...memberNames, trimmed];
        }
        setMemberNames(newMemberNames);
        const validMembers = newMemberNames.map((n) => n.trim()).filter(Boolean);
        if (newSenderName.trim() && validMembers.length > 0) {
            notifySenderChange({
                name: newSenderName.trim(),
                type: 'group',
                member_names: validMembers,
            });
        }
    };

    const handleNewSenderUpdate = () => {
        if (senderType === 'individual') {
            if (newSenderName.trim()) {
                notifySenderChange({
                    name: newSenderName.trim(),
                    type: 'individual',
                });
            } else {
                notifySenderChange(null);
            }
        } else {
            const validMembers = memberNames.filter(name => name.trim());
            if (newSenderName.trim() && validMembers.length > 0) {
                notifySenderChange({
                    name: newSenderName.trim(),
                    type: 'group',
                    member_names: validMembers.map(name => name.trim()),
                });
            } else {
                notifySenderChange(null);
            }
        }
    };

    const renderEditSenderForm = () => (
        <div className="space-y-4 rounded-md border border-gray-300 bg-gray-50 p-4">
            {/* Sender Type */}
            <div>
                <InputLabel value="Sender Type" />
                <div className="mt-2 flex gap-4">
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name="new_sender_type"
                            value="individual"
                            checked={senderType === 'individual'}
                            onChange={(e) => {
                                const newType = e.target.value;
                                setSenderType(newType);
                                setMemberNames(['']);
                                setTimeout(() => {
                                    if (newType === 'individual') {
                                        if (newSenderName.trim()) {
                                            notifySenderChange({
                                                name: newSenderName.trim(),
                                                type: 'individual',
                                            });
                                        } else {
                                            notifySenderChange(null);
                                        }
                                    } else {
                                        notifySenderChange(null);
                                    }
                                }, 0);
                            }}
                            className="mr-2"
                        />
                        <span>Individual</span>
                    </label>
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name="new_sender_type"
                            value="group"
                            checked={senderType === 'group'}
                            onChange={(e) => {
                                setSenderType(e.target.value);
                                if (memberNames.length === 0) {
                                    setMemberNames(['']);
                                }
                            }}
                            className="mr-2"
                        />
                        <span>Group</span>
                    </label>
                </div>
            </div>

            {/* Sender Name */}
            <div>
                <InputLabel htmlFor="new_sender_name" value={senderType === 'group' ? 'Group Name' : 'Sender Name'} />
                <TextInput
                    id="new_sender_name"
                    type="text"
                    value={newSenderName}
                    onChange={(e) => {
                        const name = e.target.value;
                        setNewSenderName(name);
                        setTimeout(() => {
                            if (senderType === 'individual') {
                                if (name.trim()) {
                                    notifySenderChange({
                                        name: name.trim(),
                                        type: 'individual',
                                    });
                                } else {
                                    notifySenderChange(null);
                                }
                            } else {
                                const validMembers = memberNames.filter(n => n.trim());
                                if (name.trim() && validMembers.length > 0) {
                                    notifySenderChange({
                                        name: name.trim(),
                                        type: 'group',
                                        member_names: validMembers.map(n => n.trim()),
                                    });
                                } else {
                                    notifySenderChange(null);
                                }
                            }
                        }, 0);
                    }}
                    className="mt-1 block w-full"
                    placeholder={senderType === 'group' ? 'Enter group name...' : 'Enter sender name...'}
                />
            </div>

            {/* Group Members */}
            {senderType === 'group' && (
                <div>
                    <div className="flex items-center justify-between">
                        <InputLabel value="Members" />
                        <PrimaryButton
                            type="button"
                            onClick={handleAddMember}
                            className="px-3 py-1 text-xs"
                        >
                            Add Member
                        </PrimaryButton>
                    </div>
                    {savedMemberNames.length > 0 && (
                        <div className="mt-2">
                            <p className="mb-1.5 text-xs text-gray-500">Saved names (click to add)</p>
                            <div className="flex flex-wrap gap-1.5">
                                {savedMemberNames.map((savedName) => {
                                    const alreadyAdded = memberNames.map((n) => n.trim()).filter(Boolean).includes(savedName.trim());
                                    return (
                                        <button
                                            key={savedName}
                                            type="button"
                                            onClick={() => handleAddSavedName(savedName)}
                                            disabled={alreadyAdded}
                                            className="rounded-full border border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {savedName}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    <div className="mt-2 space-y-2">
                        {memberNames.map((name, index) => (
                            <div key={index} className="flex gap-2">
                                <TextInput
                                    type="text"
                                    value={name}
                                    onChange={(e) => {
                                        handleMemberNameChange(index, e.target.value);
                                    }}
                                    className="flex-1"
                                    placeholder={`Member ${index + 1} name...`}
                                />
                                {memberNames.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            handleRemoveMember(index);
                                        }}
                                        className="rounded-md border border-red-300 bg-white px-3 py-2 text-sm text-red-700 hover:bg-red-50"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    // When editing a transaction: show only edit sender form or read-only sender (no tabs)
    if (allowEditSender && senderForEdit) {
        if (!senderForEdit.can_edit) {
            return (
                <div className="space-y-4">
                    <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
                        <span className="font-medium text-gray-700">{senderForEdit.name}</span>
                        {senderForEdit.type === 'group' && (
                            <>
                                <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
                                    Group
                                </span>
                                {senderForEdit.members?.length > 0 && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        Members: {senderForEdit.members.join(', ')}
                                    </p>
                                )}
                            </>
                        )}
                        <p className="mt-1 text-xs text-gray-500">You cannot edit this sender.</p>
                    </div>
                </div>
            );
        }
        return (
            <div className="space-y-4">
                {renderEditSenderForm()}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Mode Toggle */}
            <div className="flex gap-4">
                <label className="flex items-center">
                    <input
                        type="radio"
                        name="sender_mode"
                        checked={mode === 'select'}
                        onChange={() => handleModeChange('select')}
                        className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Select Existing</span>
                </label>
                <label className="flex items-center">
                    <input
                        type="radio"
                        name="sender_mode"
                        checked={mode === 'create'}
                        onChange={() => handleModeChange('create')}
                        className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Create New</span>
                </label>
                {showEditSenderOption && (
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name="sender_mode"
                            checked={mode === 'edit'}
                            onChange={() => handleModeChange('edit')}
                            className="mr-2"
                        />
                        <span className="text-sm font-medium text-gray-700">Edit Sender</span>
                    </label>
                )}
            </div>

            {mode === 'select' ? (
                /* Select Existing Sender */
                <div className="relative">
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

                    {showDropdown && filteredSenders.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-300 bg-white shadow-lg">
                            <ul className="max-h-60 overflow-auto py-1">
                                {filteredSenders.map((sender) => (
                                    <li
                                        key={sender.id}
                                        onClick={() => handleSelectSender(sender.id)}
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
                            No senders found. Switch to "Create New" to add one.
                        </div>
                    )}

                    {selectedSender && !showDropdown && (
                        <div className="mt-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
                            <span className="font-medium text-gray-700">{selectedSender.name}</span>
                            {selectedSender.type === 'group' && (
                                <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
                                    Group
                                </span>
                            )}
                            {selectedSender.type === 'group' && selectedSender.members?.length > 0 && (
                                <p className="mt-1 text-xs text-gray-500">
                                    Members: {selectedSender.members.join(', ')}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            ) : (mode === 'create' || mode === 'edit') ? (
                <>
                    {mode === 'edit' && (
                        <p className="text-sm text-gray-600">Editing sender name and members for this transaction.</p>
                    )}
                    {renderEditSenderForm()}
                </>
            ) : null}
        </div>
    );
}
