import { isSameDay, isSameMonth, isSameYear, parseISO } from 'date-fns';

export function calculateAnalytics(transactions) {
    const now = new Date();

    return transactions.reduce((acc, t) => {
        const tDate = parseISO(t.date);

        // Total
        acc.total += t.amount;

        // Daily
        if (isSameDay(tDate, now)) acc.daily += t.amount;

        // Monthly
        if (isSameMonth(tDate, now)) acc.monthly += t.amount;

        // Yearly
        if (isSameYear(tDate, now)) acc.yearly += t.amount;

        // Category
        acc.byCategory[t.category] = (acc.byCategory[t.category] || 0) + t.amount;

        // App
        acc.byApp[t.app] = (acc.byApp[t.app] || 0) + t.amount;

        return acc;
    }, {
        total: 0,
        daily: 0,
        monthly: 0,
        yearly: 0,
        byCategory: {},
        byApp: {}
    });
}
