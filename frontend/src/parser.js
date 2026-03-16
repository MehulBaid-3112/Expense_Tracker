export function parseTransactionMessage(message) {
    if (!message || typeof message !== 'string') return null;

    // 1. Extract Amount
    const amountMatch = message.match(/(?:₹|Rs\.?|INR)\s*([\d,]+\.?\d*)/i);
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : null;

    // 2. Extract Payment App / Method
    let app = 'UPI'; // Default fallback
    const appMatch = message.match(/(?:via|using|through)\s+([a-zA-Z\s]+?)(?:\s+(?:at|to|for|on)|$)/i);
    if (appMatch) {
        app = appMatch[1].trim();
    } else if (message.toLowerCase().includes('debit card')) {
        app = 'Debit Card';
    } else if (message.toLowerCase().includes('credit card')) {
        app = 'Credit Card';
    } else if (message.toLowerCase().includes('upi')) {
        app = 'UPI';
    }

    // Normalize app name
    const appLower = app.toLowerCase();
    if (appLower.includes('gpay') || appLower.includes('google')) app = 'GPay';
    else if (appLower.includes('paytm')) app = 'Paytm';
    else if (appLower.includes('phonepe')) app = 'PhonePe';
    else if (appLower.includes('upi')) app = 'UPI';
    else if (appLower.includes('debit')) app = 'Debit Card';
    else if (appLower.includes('credit')) app = 'Credit Card';

    // 3. Extract Merchant / Receiver
    let merchant = null;

    const merchantPatterns = [
        /paid\s+(?:using|via)\s+.*?\s+to\s+(.*?)(?:\s+(?:via|using|for|on)|\s*$)/i,
        /payment(?: of .+?)?\s+made\s+to\s+(.*?)(?:\s+(?:via|using|for|on)|\s*$)/i,
        /(?:paid|sent|transferred)\s+to\s+(.*?)(?:\s+(?:via|using|for|on)|\s*$)/i,
        /(?:spent|purchase)\s+at\s+(.*?)(?:\s+(?:via|using|for|on)|\s*$)/i,
        /shopping done at\s+(.*?)(?:\s+(?:via|using|for|on)|\s*$)/i,
        /spent on\s+(.*?)(?:\s+(?:via|using|for|on)|\s*$)/i,
        /debited.*?\s+at\s+(.*?)(?:\s+(?:via|using|for|on)|\s*$)/i,
        /paid at\s+(.*?)(?:\s+(?:via|using|for|on)|\s*$)/i,
        /(?:paid|deducted|charged)\s+for\s+(.*?)(?:\s+(?:subscription|membership|bill|recharge)|\s+(?:via|using|on)|\s*$)/i
    ];

    for (const pattern of merchantPatterns) {
        const match = message.match(pattern);
        if (match && match[1]) {
            merchant = match[1].trim();
            break;
        }
    }

    if (!merchant || merchant.length === 0) {
        merchant = 'Unknown';
    } else {
        merchant = merchant.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }

    // 4. Determine Category
    const categories = {
        Food: ['zomato', 'swiggy', 'kfc', 'mcdonalds', 'restaurant', 'cafe', 'dominos', 'pizza', 'burger'],
        Travel: ['uber', 'ola', 'irctc', 'makemytrip', 'redbus', 'flight', 'train', 'ticket', 'metro', 'bus'],
        Shopping: ['amazon', 'flipkart', 'myntra', 'ajio', 'mall', 'store', 'reliance', 'bazaar', 'mart', 'supermarket', 'groceries'],
        Bills: ['electricity', 'water', 'recharge', 'jio', 'airtel', 'vi', 'bill', 'wifi', 'broadband', 'gas'],
        Entertainment: ['bookmyshow', 'netflix', 'amazon prime', 'hotstar', 'cinema', 'movie', 'pvr', 'inox', 'spotify']
    };

    let category = 'Others';
    const lMerchant = merchant.toLowerCase();
    const lMessage = message.toLowerCase();

    for (const [cat, keywords] of Object.entries(categories)) {
        if (keywords.some(kw => lMerchant.includes(kw) || lMessage.includes(kw))) {
            category = cat;
            break;
        }
    }

    // Fallbacks if category is still 'Others'
    if (category === 'Others') {
        if (lMessage.includes('bill')) category = 'Bills';
        else if (lMessage.includes('subscription') || lMessage.includes('membership')) category = 'Entertainment';
        else if (lMessage.includes('shopping') || lMessage.includes('purchase')) category = 'Shopping';
    }

    if (amount) {
        return {
            id: crypto.randomUUID(),
            amount,
            merchant: merchant || 'Unknown',
            app: app || 'Unknown',
            date: new Date().toISOString(),
            category,
            type: 'expense'
        };
    }

    return null;
}
