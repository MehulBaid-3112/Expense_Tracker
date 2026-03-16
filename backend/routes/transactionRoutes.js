import express from 'express';
import { processIncomingSMS, getTransactions, addTransaction, deleteTransaction, getAnalytics } from '../controllers/transactionController.js';

const router = express.Router();

// Webhook endpoint to receive SMS payload from Twilio, Android Retriever, etc.
router.post('/sms-webhook', processIncomingSMS);

// Get all transactions
router.get('/', getTransactions);

// Add a transaction manually
router.post('/', addTransaction);

// Delete transaction
router.delete('/:id', deleteTransaction);

// Analytics endpoints
router.get('/analytics', getAnalytics);
router.get('/monthly-report', (req, res) => res.json({ message: "Monthly PDF/CSV report generation logic goes here" }));

export default router;
