import Transaction from '../models/Transaction.js';
import { parseTransactionMessage } from '../sms-parser/parser.js';

export const processIncomingSMS = async (req, res) => {
    try {
        const { messageBody, sender } = req.body;

        if (!messageBody) {
            return res.status(400).json({ error: 'Message body is required' });
        }

        const parsedData = parseTransactionMessage(messageBody);

        if (parsedData) {
            const newTransaction = new Transaction({
                ...parsedData,
                rawMessage: messageBody
            });
            await newTransaction.save();

            return res.status(201).json({
                success: true,
                message: 'Transaction successfully processed',
                transaction: newTransaction
            });
        }

        return res.status(422).json({
            success: false,
            message: 'Could not extract transaction data from given message'
        });

    } catch (error) {
        console.error('Error processing SMS:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ date: -1 });
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const addTransaction = async (req, res) => {
    try {
        const newTransaction = new Transaction(req.body);
        await newTransaction.save();
        res.status(201).json(newTransaction);
    } catch (error) {
        console.error('Error adding transaction:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};

export const deleteTransaction = async (req, res) => {
    try {
        await Transaction.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Transaction deleted' });
    } catch (error) {
        console.error('Error deleting transaction:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getAnalytics = async (req, res) => {
    try {
        const transactions = await Transaction.find();

        // Process analytics map on backend so frontend doesn't need to do it all
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const today = now.toDateString();

        let totalSpendingToday = 0;
        let monthlySpendingSummary = 0;
        const categorySpending = {};
        const monthlyTrends = {};

        transactions.forEach(t => {
            const d = new Date(t.date);

            if (t.type === 'debit') {
                if (d.toDateString() === today) totalSpendingToday += t.amount;
                if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
                    monthlySpendingSummary += t.amount;
                }

                categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;

                const monthKey = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
                monthlyTrends[monthKey] = (monthlyTrends[monthKey] || 0) + t.amount;
            }
        });

        res.status(200).json({
            totalSpendingToday,
            monthlySpendingSummary,
            categorySpending,
            monthlyTrends
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
