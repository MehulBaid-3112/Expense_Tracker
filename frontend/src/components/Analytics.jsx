import React, { useMemo } from 'react';
import { calculateAnalytics } from '../analytics';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { format, parseISO, startOfMonth, subMonths } from 'date-fns';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function Analytics({ transactions }) {
    const stats = calculateAnalytics(transactions);

    const colors = [
        'rgba(99, 102, 241, 0.8)',   // indigo
        'rgba(16, 185, 129, 0.8)',   // emerald
        'rgba(245, 158, 11, 0.8)',   // amber
        'rgba(239, 68, 68, 0.8)',    // red
        'rgba(139, 92, 246, 0.8)',   // purple
        'rgba(14, 165, 233, 0.8)'    // sky
    ];

    const categoryData = useMemo(() => {
        const labels = Object.keys(stats.byCategory);
        const data = Object.values(stats.byCategory);
        return {
            labels,
            datasets: [
                {
                    label: 'Spending by Category (₹)',
                    data,
                    backgroundColor: colors.slice(0, labels.length),
                    borderWidth: 0,
                },
            ],
        };
    }, [stats.byCategory]);

    const appData = useMemo(() => {
        const labels = Object.keys(stats.byApp);
        const data = Object.values(stats.byApp);
        return {
            labels,
            datasets: [
                {
                    label: 'Spending by App (₹)',
                    data,
                    backgroundColor: colors.slice(0, labels.length).reverse(),
                    borderWidth: 0,
                },
            ],
        };
    }, [stats.byApp]);

    // Last 6 months trend
    const trendData = useMemo(() => {
        const labels = [];
        const dataMap = {};
        const now = new Date();

        for (let i = 5; i >= 0; i--) {
            const monthDate = subMonths(now, i);
            const mLabel = format(monthDate, 'MMM yyyy');
            labels.push(mLabel);
            dataMap[mLabel] = 0;
        }

        transactions.forEach(t => {
            const tLabel = format(parseISO(t.date), 'MMM yyyy');
            if (dataMap[tLabel] !== undefined) {
                dataMap[tLabel] += t.amount;
            }
        });

        return {
            labels,
            datasets: [
                {
                    label: 'Monthly Spending Trend (₹)',
                    data: labels.map(l => dataMap[l]),
                    backgroundColor: 'rgba(99, 102, 241, 0.8)',
                    borderRadius: 6,
                }
            ]
        };
    }, [transactions]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: '#9ca3af',
                    font: { family: "'Inter', sans-serif" }
                }
            }
        }
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(156, 163, 175, 0.1)' } },
            x: { ticks: { color: '#9ca3af' }, grid: { display: false } }
        },
        plugins: {
            legend: { display: false }
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Expense Analytics</h2>

            {transactions.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow-sm border border-gray-100 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400">Add transactions to see your expense analytics.</p>
                </div>
            ) : (
                <>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-80">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Monthly Trend</h3>
                        <div className="h-60">
                            <Bar data={trendData} options={barOptions} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-80">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">By Category</h3>
                            <div className="h-56">
                                <Pie data={categoryData} options={chartOptions} />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-80">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">By Payment App</h3>
                            <div className="h-56">
                                <Pie data={appData} options={chartOptions} />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
