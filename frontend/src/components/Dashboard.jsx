import React from 'react';
import { calculateAnalytics } from '../analytics';
import { IndianRupee, TrendingUp, Calendar, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function Dashboard({ transactions }) {
    const stats = calculateAnalytics(transactions);

    const recent = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

    const StatCard = ({ title, amount, icon: Icon, colorClass, bgClass }) => (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                    <p className={`text-2xl font-bold mt-2 ${colorClass}`}>₹{amount.toLocaleString()}</p>
                </div>
                <div className={`p-3 rounded-full ${bgClass}`}>
                    <Icon size={24} className={colorClass} />
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Spending" amount={stats.total} icon={IndianRupee} colorClass="text-indigo-600 dark:text-indigo-400" bgClass="bg-indigo-100 dark:bg-indigo-900/50" />
                <StatCard title="Today" amount={stats.daily} icon={Clock} colorClass="text-green-600 dark:text-green-400" bgClass="bg-green-100 dark:bg-green-900/50" />
                <StatCard title="This Month" amount={stats.monthly} icon={Calendar} colorClass="text-blue-600 dark:text-blue-400" bgClass="bg-blue-100 dark:bg-blue-900/50" />
                <StatCard title="This Year" amount={stats.yearly} icon={TrendingUp} colorClass="text-purple-600 dark:text-purple-400" bgClass="bg-purple-100 dark:bg-purple-900/50" />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {recent.length === 0 ? (
                        <p className="p-6 text-center text-gray-500 dark:text-gray-400">No recent transactions found.</p>
                    ) : (
                        recent.map(t => (
                            <div key={t._id || t.id} className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <div className="flex items-center space-x-4">
                                    <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                                        {t.merchant.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{t.merchant}</p>
                                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            <span>{t.category}</span>
                                            <span className="mx-2">•</span>
                                            <span>{format(parseISO(t.date), 'MMM d, h:mm a')}</span>
                                            <span className="mx-2">•</span>
                                            <span>via {t.app}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-red-600 dark:text-red-400">-₹{t.amount.toLocaleString()}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
