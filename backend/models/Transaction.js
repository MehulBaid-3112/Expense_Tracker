import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true,
    },
    merchant: {
        type: String,
        required: true,
    },
    app: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
        enum: ['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Others'],
        default: 'Others'
    },
    type: {
        type: String,
        enum: ['debit', 'credit'],
        default: 'debit'
    },
    date: {
        type: Date,
        default: Date.now
    },
    rawMessage: {
        type: String,
    }
}, { timestamps: true });

export default mongoose.model('Transaction', transactionSchema);
