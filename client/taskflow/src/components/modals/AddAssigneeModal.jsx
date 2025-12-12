import { useState, useEffect, useRef } from "react";
import { useApi } from "../../components/hooks/useApi";
import Avatar from "../../components/common/Avatar";
import { FiSearch, FiX, FiCheck, FiUsers } from "react-icons/fi";
import { toast } from "react-toastify";
import { useUser } from "../../contexts/UserContext";

const getPlainUser = (result) => (result ? result.user || result : {});

const AddAssigneeModal = ({ isOpen, onClose, taskId, currentAssignees = [], project, onAdd }) => {
    const { currentUser } = useUser();
    const { makeRequest: searchUsers } = useApi();
    const { makeRequest: addAssignees } = useApi();

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [projectMembers, setProjectMembers] = useState([]);
    const searchTimeoutRef = useRef(null);
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (!isOpen) {
            setSearchQuery("");
            setSearchResults([]);
            setShowResults(false);
            setSelectedUsers([]);
        } else {
            if (project && project.members) {
                const members = project.members
                    .map((member) => getPlainUser(member))
                    .filter((member) => {
                        if (!member || !member.id) return false;
                        if (member.id === currentUser?.id) return false;
                        return !currentAssignees.some(a => a.id === member.id);
                    });
                setProjectMembers(members);
                setSearchResults(members);
            }

            const timeoutId = setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
            return () => clearTimeout(timeoutId);
        }
    }, [isOpen, project, currentAssignees, currentUser]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleInputChange = (e) => {
        const value = e.target.value || "";
        setSearchQuery(value);

        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);


        if (project) {
            if (!showResults) return;

            if (!value.trim()) {
                setSearchResults(projectMembers);
                return;
            }

            const filteredMembers = projectMembers.filter((member) =>
                member.display_name?.toLowerCase().includes(value.toLowerCase()) ||
                member.email?.toLowerCase().includes(value.toLowerCase())
            );
            setSearchResults(filteredMembers);
            return;
        }

        if (!value.includes("@")) {
            setShowResults(false);
            setSearchResults([]);
            return;
        }

        const query = value.replace(/@/g, "").trim();

        if (!query) {
            setShowResults(false);
            setSearchResults([]);
            return;
        }

        searchTimeoutRef.current = setTimeout(async () => {
            try {
                const url = `/api/search-assignees/?user=${encodeURIComponent(query)}`;
                const results = await searchUsers(url, "GET");

                const filteredResults = Array.isArray(results)
                    ? results.filter(result => {
                        const u = getPlainUser(result);
                        if (!u || !u.id || !u.email) return false;
                        if (u.id === currentUser?.id) return false;
                        if (currentAssignees.some(a => a.id === u.id)) return false;
                        return !selectedUsers.some(s => s.id === u.id);
                    })
                    : [];

                setSearchResults(filteredResults);
                if (filteredResults.length > 0) {
                    setShowResults(true);
                }
            } catch (err) {
                console.error("Search failed:", err);
                setSearchResults([]);
            }
        }, 300);
    };

    const handleFocus = () => {
        if (project && projectMembers.length > 0) {
            setSearchResults(projectMembers);
            setShowResults(true);
        }
    };

    const handleSelectUser = (userResult) => {
        const user = getPlainUser(userResult);

        const isAlreadySelected = selectedUsers.some(u => u.id === user.id);

        if (isAlreadySelected) {
            setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
        } else {
            setSelectedUsers([...selectedUsers, user]);
        }

        if (!project) {
            setSearchQuery("");
            setSearchResults([]);
            setShowResults(false);
        }

        inputRef.current?.focus();
    };

    const handleRemoveSelectedUser = (id) => {
        setSelectedUsers(selectedUsers.filter(u => u.id !== id));
    };

    const handleAddAssignees = async () => {
        if (!selectedUsers.length) return;

        try {
            await addAssignees(`/api/tasks/${taskId}/assignees/`, "PATCH", {
                assignee_ids: selectedUsers.map(u => u.id)
            });
            onAdd();
            toast.success("Assignees added successfully");
            onClose();
        } catch (err) {
            console.error("Failed to add assignees:", err);
            toast.error("Failed to add assignees. Please try again.");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Add Assignees</h2>
                        <p className="text-gray-500 mt-1">
                            {project
                                ? "Select team members from the project to assign to this task"
                                : "Search and select team members to assign to this task"
                            }
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-700"
                    >
                        <FiX size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 flex-1 overflow-visible">
                    {/* Selected Users */}
                    <div className="mb-6 min-h-[40px]">
                        {selectedUsers.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {selectedUsers.map(user => (
                                    <div
                                        key={user.id}
                                        className="flex items-center gap-2 pl-1 pr-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full"
                                    >
                                        <div className="w-6 h-6">
                                            <Avatar name={user.display_name} url={user.avatar} size={6} />
                                        </div>
                                        <span className="text-sm font-medium">{user.display_name}</span>
                                        <button
                                            onClick={() => handleRemoveSelectedUser(user.id)}
                                            className="ml-1 p-0.5 rounded-full hover:bg-blue-200 text-blue-500"
                                        >
                                            <FiX size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400 italic text-sm">No new assignees selected yet...</p>
                        )}
                    </div>

                    {/* Search */}
                    <div ref={dropdownRef} className="relative">
                        <div className="relative">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                ref={inputRef}
                                type="text"
                                value={searchQuery}
                                onChange={handleInputChange}
                                onFocus={handleFocus}
                                placeholder={
                                    project
                                        ? "Search project members..."
                                        : "Search by name or email (e.g. @john)"
                                }
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                            {project && (
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                                    <FiUsers size={12} />
                                    Project Members
                                </span>
                            )}
                        </div>

                        {showResults && searchResults.length > 0 && (
                            <div className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-80 overflow-y-auto">
                                <ul className="py-2">
                                    {searchResults.map((uResult) => {
                                        const u = getPlainUser(uResult);
                                        const isSelected = selectedUsers.some(s => s.id === u.id);
                                        return (
                                            <li
                                                key={u.id}
                                                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200 ${isSelected
                                                    ? "bg-blue-50 border-l-4 border-blue-500"
                                                    : "hover:bg-gray-50"
                                                    }`}
                                                onClick={() => handleSelectUser(uResult)}
                                            >
                                                <Avatar name={u.display_name} url={u.avatar} size={8} />
                                                <div className="flex-1">
                                                    <p className={`font-semibold ${isSelected ? "text-blue-800" : "text-gray-800"}`}>
                                                        {u.display_name}
                                                    </p>
                                                    <p className="text-sm text-gray-500">{u.email}</p>
                                                </div>
                                                {isSelected ? (
                                                    <div className="flex-shrink-0 p-1.5 bg-blue-100 rounded-full">
                                                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-md text-gray-600">
                                                        Add
                                                    </span>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-gray-600 font-medium hover:text-gray-800 hover:bg-gray-200/50 rounded-lg"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={!selectedUsers.length}
                        onClick={handleAddAssignees}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <FiCheck size={18} />
                        Add {selectedUsers.length > 0 ? `${selectedUsers.length} Member${selectedUsers.length > 1 ? "s" : ""}` : "Members"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddAssigneeModal;
