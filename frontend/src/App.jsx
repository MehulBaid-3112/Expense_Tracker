import React, { useState, useEffect } from 'react';
import { getTransactions, saveTransaction, deleteTransaction } from './storage';
import Dashboard from './components/Dashboard';
import AddTransaction from './components/AddTransaction';
import TransactionHistory from './components/TransactionHistory';
import Analytics from './components/Analytics';
import { LayoutDashboard, PlusCircle, History, PieChart, Moon, Sun } from 'lucide-react';

export default function App() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [transactions, setTransactions] = useState([]);
    const [darkMode, setDarkMode] = useState(false);

    const loadData = async () => {
        const data = await getTransactions();
        setTransactions(data);
    };

    useEffect(() => {
        loadData();
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setDarkMode(true);
        }
    }, []);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    const handleAddTransaction = async (transaction) => {
        await saveTransaction(transaction);
        await loadData();
    };

    const handleDeleteTransaction = async (id) => {
        await deleteTransaction(id);
        await loadData();
    };

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'add', label: 'Add Expense', icon: PlusCircle },
        { id: 'history', label: 'History', icon: History },
        { id: 'analytics', label: 'Analytics', icon: PieChart },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <nav className="fixed w-full z-50 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">ExpenseTracker</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setDarkMode(!darkMode)}
                                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                            >
                                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex pt-16 h-screen">
                {/* Sidebar */}
                <aside className="w-64 fixed h-full bg-white dark:bg-gray-800 shadow-sm border-r border-gray-200 dark:border-gray-700 hidden md:block">
                    <div className="py-6 px-4 space-y-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === tab.id
                                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400'
                                        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    <Icon size={20} />
                                    <span className="font-medium">{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </aside>

                {/* Mobile Nav */}
                <nav className="md:hidden fixed bottom-0 w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
                    <div className="flex justify-around py-3">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex flex-col items-center space-y-1 ${activeTab === tab.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'
                                        }`}
                                >
                                    <Icon size={20} />
                                    <span className="text-xs">{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </nav>

                {/* Main Content */}
                <main className="flex-1 md:ml-64 p-4 sm:p-6 lg:p-8 overflow-y-auto mb-16 md:mb-0">
                    <div className="max-w-4xl mx-auto">
                        {activeTab === 'dashboard' && <Dashboard transactions={transactions} />}
                        {activeTab === 'add' && <AddTransaction onAdd={handleAddTransaction} />}
                        {activeTab === 'history' && <TransactionHistory transactions={transactions} onDelete={handleDeleteTransaction} />}
                        {activeTab === 'analytics' && <Analytics transactions={transactions} />}
                    </div>
                </main>
            </div>
        </div>
    );
}
