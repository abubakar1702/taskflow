import React, { useState } from 'react';
import { FiSearch, FiCheckCircle, FiSettings, FiBellOff, FiRefreshCw } from 'react-icons/fi';
import NotificationCard from './NotificationCard';
import { useApi } from '../hooks/useApi';

const AllNotifications = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const { data, loading, error, refetch, makeRequest } = useApi('/api/notifications/', 'GET', null, []);
    const notifications = data || [];

    const tabs = [
        { id: 'all', label: 'All' },
        { id: 'unread', label: 'Unread' },
        { id: 'mentions', label: 'Mentions' },
        { id: 'system', label: 'System' },
    ];

    const handleMarkAllAsRead = async () => {
        const unreadNotifications = notifications.filter(n => !n.is_read);
        try {
            await Promise.all(
                unreadNotifications.map(n => makeRequest(`/api/notifications/${n.id}/read/`, 'PATCH'))
            );
            refetch();
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    const filteredNotifications = notifications.filter(n => {
        if (activeTab === 'unread') return !n.is_read;
        if (activeTab === 'mentions') return n.message.includes('@');
        if (activeTab === 'system') return !n.data?.assigned_by;
        return true;
    }).filter(n =>
        n.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.type.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage all your activities and alerts</p>
                </div>
                <div className="flex gap-2">
                    <button
                        disabled={loading || !notifications.some(n => !n.is_read)}
                        onClick={handleMarkAllAsRead}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        <FiCheckCircle size={16} />
                        Mark all read
                    </button>
                    <button
                        onClick={() => refetch()}
                        className="p-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                        title="Refresh"
                    >
                        <FiRefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center p-2 gap-2">
                    <div className="flex-1 flex items-center bg-gray-50 rounded-xl px-3 py-2 border border-transparent focus-within:border-blue-500 transition-colors">
                        <FiSearch className="text-gray-400 mr-2" size={18} />
                        <input
                            type="text"
                            placeholder="Search notifications..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none outline-none w-full text-sm text-gray-900"
                        />
                    </div>
                    <div className="flex items-center gap-1 p-1 bg-gray-50 rounded-xl border border-gray-100">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Notifications List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-8 space-y-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="animate-pulse flex gap-4 border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                                <div className="rounded-full bg-gray-100 h-10 w-10 shrink-0"></div>
                                <div className="flex-1 space-y-2 py-1">
                                    <div className="h-2.5 bg-gray-100 rounded w-1/4"></div>
                                    <div className="h-2 bg-gray-100 rounded w-3/4"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="py-20 text-center">
                        <p className="text-red-500 font-medium">Failed to load notifications.</p>
                        <button onClick={() => refetch()} className="text-blue-600 text-sm mt-2 hover:underline">Try again</button>
                    </div>
                ) : filteredNotifications.length > 0 ? (
                    <div>
                        {filteredNotifications.map((notification) => (
                            <NotificationCard
                                key={notification.id}
                                notification={notification}
                                onUpdate={refetch}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FiBellOff className="text-gray-300" size={40} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">No notifications found</h3>
                        <p className="text-gray-500 max-w-xs mx-auto">
                            {searchQuery ? `We couldn't find any notifications matching "${searchQuery}"` : "You don't have any notifications in this category yet."}
                        </p>
                    </div>
                )}
            </div>

            {/* Load More/Pagination - Future */}
            {!loading && filteredNotifications.length > 0 && (
                <div className="mt-6 text-center">
                    <button className="text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors">
                        End of notifications
                    </button>
                </div>
            )}
        </div>
    );
};

export default AllNotifications;