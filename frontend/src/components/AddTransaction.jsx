import React, { useState } from 'react';
import { processSMSWeb } from '../storage';
import { MessageSquare, Edit3, CheckCircle2, AlertCircle, Loader } from 'lucide-react';

export default function AddTransaction({ onAdd }) {
    const [mode, setMode] = useState('auto'); // 'auto' or 'manual'

    // Auto mode state
    const [message, setMessage] = useState('');
    const [parseResult, setParseResult] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Manual mode state
    const [manualForm, setManualForm] = useState({
        amount: '', merchant: '', app: 'UPI', category: 'Others'
    });

    const handleParse = async () => {
        setError('');
        setLoading(true);
        try {
            const data = await processSMSWeb(message);
            if (data && data.transaction) {
                // Return data directly (or simulate preview first then submit)
                // Actually processSMSWeb saves it to backend automatically. 
                // So let's alert success and notify App.jsx to reload.
                onAdd(); // just reload transactions
                setMessage('');
                setParseResult(null);
                alert('Transaction successfully parsed and saved to database!');
            }
        } catch (err) {
            setError(err.message || 'Could not extract details from the message.');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmAuto = () => {
        // Obsolete since processSMSWeb saves directly to db now.
    };

    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (!manualForm.amount || !manualForm.merchant) return;

        const newTx = {
            id: crypto.randomUUID(),
            amount: parseFloat(manualForm.amount),
            merchant: manualForm.merchant,
            app: manualForm.app,
            category: manualForm.category,
            date: new Date().toISOString(),
            type: 'debit'
        };

        onAdd(newTx);
        setManualForm({ amount: '', merchant: '', app: 'UPI', category: 'Others' });
        alert('Transaction added manually!');
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add Expense</h2>

            <div className="flex space-x-4 mb-4">
                <button
                    onClick={() => setMode('auto')}
                    className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-colors ${mode === 'auto'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                        }`}
                >
                    <MessageSquare size={18} />
                    <span>Auto Parse SMS</span>
                </button>
                <button
                    onClick={() => setMode('manual')}
                    className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-colors ${mode === 'manual'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                        }`}
                >
                    <Edit3 size={18} />
                    <span>Manual Entry</span>
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                {mode === 'auto' ? (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Paste Bank/App Notification Message
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="e.g. ₹250 paid to Zomato via GPay"
                                className="w-full h-32 px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white transition-colors resize-none"
                            ></textarea>
                        </div>

                        <button
                            onClick={handleParse}
                            disabled={!message.trim() || loading}
                            className="w-full py-3 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400 rounded-lg font-medium hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                        >
                            {loading && <Loader className="animate-spin" size={18} />}
                            <span>{loading ? 'Parsing...' : 'Parse Message & Save'}</span>
                        </button>

                        {error && (
                            <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                <AlertCircle size={20} />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}

                    </div>
                ) : (
                    <form onSubmit={handleManualSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount (₹)</label>
                            <input
                                type="number"
                                required
                                min="0.01"
                                step="0.01"
                                value={manualForm.amount}
                                onChange={e => setManualForm({ ...manualForm, amount: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Merchant Name</label>
                            <input
                                type="text"
                                required
                                value={manualForm.merchant}
                                onChange={e => setManualForm({ ...manualForm, merchant: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Payment App</label>
                                <select
                                    value={manualForm.app}
                                    onChange={e => setManualForm({ ...manualForm, app: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option>UPI</option>
                                    <option>GPay</option>
                                    <option>Paytm</option>
                                    <option>PhonePe</option>
                                    <option>Others</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                                <select
                                    value={manualForm.category}
                                    onChange={e => setManualForm({ ...manualForm, category: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option>Food</option>
                                    <option>Travel</option>
                                    <option>Shopping</option>
                                    <option>Bills</option>
                                    <option>Entertainment</option>
                                    <option>Others</option>
                                </select>
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="mt-6 w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                        >
                            Add Expense Manually
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
