import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import transactionRoutes from './routes/transactionRoutes.js';
import { MongoMemoryServer } from 'mongodb-memory-server';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/transactions', transactionRoutes);

// Database connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 2000 // Short timeout to fail fast
        });
        console.log('MongoDB connected successfully via MONGO_URI');
    } catch (err) {
        console.log('Local MongoDB not found, starting MongoMemoryServer for zero-config testing...', err.message);
        const mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
        console.log(`MongoMemoryServer connected successfully at ${uri}`);
    }
};

import Transaction from './models/Transaction.js';

const generateMockData = async () => {
    const count = await Transaction.countDocuments();
    if (count > 0) return;
    console.log('Seeding Mock Database...');
    const apps = ['GPay', 'Paytm', 'PhonePe', 'UPI'];
    const categories = {
        Food: ['Zomato', 'Swiggy', 'KFC', 'McDonalds'],
        Travel: ['Uber', 'Ola', 'MakeMyTrip'],
        Shopping: ['Amazon', 'Flipkart', 'Myntra'],
        Bills: ['Electricity Board', 'Jio Postpaid', 'Gas Agency'],
        Entertainment: ['BookMyShow', 'Netflix']
    };
    const dummy = [];
    for (let i = 0; i < 40; i++) {
        const randomCategory = Object.keys(categories)[Math.floor(Math.random() * Object.keys(categories).length)];
        const merchant = categories[randomCategory][Math.floor(Math.random() * categories[randomCategory].length)];
        const app = apps[Math.floor(Math.random() * apps.length)];
        const amount = Math.floor(Math.random() * 800) + 50;

        const d = new Date();
        d.setDate(d.getDate() - Math.floor(Math.random() * 60));
        dummy.push({ amount, merchant, app, category: randomCategory, date: d, type: 'debit', rawMessage: 'Mock system generated' });
    }
    await Transaction.insertMany(dummy);
    console.log('Successfully seeded 40 transactions into Memory DB.');
};

connectDB().then(async () => {
    await generateMockData();
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
