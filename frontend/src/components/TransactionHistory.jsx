import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Trash2, Search, Filter } from 'lucide-react';

export default function TransactionHistory({ transactions, onDelete }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [catFilter, setCatFilter] = useState('All');
    const [appFilter, setAppFilter] = useState('All');

    const filtered = transactions.filter(t => {
        const matchSearch = t.merchant.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCat = catFilter === 'All' || t.category === catFilter;
        const matchApp = appFilter === 'All' || t.app === appFilter;
        return matchSearch && matchCat && matchApp;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Transaction History</h2>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 mb-6 space-y-4 md:space-y-0 md:flex md:space-x-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search merchants..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div className="flex space-x-4">
                    <select
                        value={catFilter}
                        onChange={e => setCatFilter(e.target.value)}
                        className="w-full md:w-40 px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="All">All Categories</option>
                        <option>Food</option>
                        <option>Travel</option>
                        <option>Shopping</option>
                        <option>Bills</option>
                        <option>Entertainment</option>
                        <option>Others</option>
                    </select>
                    <select
                        value={appFilter}
                        onChange={e => setAppFilter(e.target.value)}
                        className="w-full md:w-40 px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="All">All Apps</option>
                        <option>GPay</option>
                        <option>Paytm</option>
                        <option>PhonePe</option>
                        <option>UPI</option>
                        <option>Others</option>
                    </select>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {filtered.length === 0 ? (
                    <p className="p-8 text-center text-gray-500 dark:text-gray-400">No transactions match your filters.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
                                    <th className="px-6 py-4 text-xs font-medium tracking-wider text-gray-500 dark:text-gray-300 uppercase">Date</th>
                                    <th className="px-6 py-4 text-xs font-medium tracking-wider text-gray-500 dark:text-gray-300 uppercase">Merchant</th>
                                    <th className="px-6 py-4 text-xs font-medium tracking-wider text-gray-500 dark:text-gray-300 uppercase">Category</th>
                                    <th className="px-6 py-4 text-xs font-medium tracking-wider text-gray-500 dark:text-gray-300 uppercase">App</th>
                                    <th className="px-6 py-4 text-xs font-medium tracking-wider text-gray-500 dark:text-gray-300 uppercase text-right">Amount</th>
                                    <th className="px-6 py-4 text-xs font-medium tracking-wider text-gray-500 dark:text-gray-300 uppercase text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filtered.map(t => (
                                    <tr key={t._id || t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                            {format(parseISO(t.date), 'MMM d, yyyy h:mm a')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            {t.merchant}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-xs">{t.category}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                            {t.app}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600 dark:text-red-400 text-right">
                                            -₹{t.amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <button
                                                onClick={() => { if (window.confirm('Delete this transaction?')) onDelete(t._id || t.id) }}
                                                className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
