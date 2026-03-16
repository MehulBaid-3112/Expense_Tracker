export function parseTransactionMessage(message) {
    if (!message || typeof message !== 'string') return null;

    // 1. Extract Amount
    const amountMatch = message.match(/(?:₹|Rs\.?|INR)\s*([\d,]+\.?\d*)/i);
    let amount = null;
    if (amountMatch) amount = parseFloat(amountMatch[1].replace(/,/g, ''));
    else {
        // Check for "Payment of {amount}" without Rs/INR
        const genericAmountMatch = message.match(/(?:payment of|transaction of|paid)\s+([\d,]+\.?\d*)/i);
        if (genericAmountMatch) amount = parseFloat(genericAmountMatch[1].replace(/,/g, ''));
    }

    // 2. Extract Type (debit / credit)
    let type = 'debit';
    const lMessage = message.toLowerCase();
    if (lMessage.includes(' credited') || lMessage.includes(' refund') || lMessage.includes(' received')) {
        type = 'credit';
    }

    // 3. Extract Payment App / Method
    let app = 'Bank/UPI';
    const appMatch = message.match(/(?:via|using|through)\s+([a-zA-Z\s]+?)(?=(?:\s+(?:at|to|for|on)|$))/i);
    if (appMatch) {
        app = appMatch[1].trim();
    } else if (lMessage.includes('debit card')) {
        app = 'Debit Card';
    } else if (lMessage.includes('credit card')) {
        app = 'Credit Card';
    } else if (lMessage.includes('upi')) {
        app = 'UPI';
    }

    // Normalize app name
    const appLower = app.toLowerCase();
    if (appLower.includes('gpay') || appLower.includes('google')) app = 'GPay';
    else if (appLower.includes('paytm')) app = 'Paytm';
    else if (appLower.includes('phonepe')) app = 'PhonePe';
    else if (appLower.includes('upi')) app = 'UPI';

    // 4. Extract Merchant / Receiver
    let merchant = null;
    const merchantPatterns = [
        /paid\s+(?:using|via)\s+.*?\s+to\s+(.+?)(?=(?:\s+(?:via|using|for|on)|$))/i,
        /payment(?: of.+?)?\s+made\s+to\s+(.+?)(?=(?:\s+(?:via|using|for|on)|$))/i,
        /(?:paid|sent|transferred)\s+to\s+(.+?)(?=(?:\s+(?:via|using|for|on)|$))/i,
        /(?:spent|purchase|shopping done)\s+at\s+(.+?)(?=(?:\s+(?:via|using|for|on)|$))/i,
        /spent on\s+(.+?)(?=(?:\s+(?:via|using|for|on)|$))/i,
        /debited.*?(?:at|from your account at)\s+(.+?)(?=(?:\s+(?:via|using|for|on)|$))/i,
        /paid at\s+(.+?)(?=(?:\s+(?:via|using|for|on)|$))/i,
        /(?:paid|deducted|charged)\s+for\s+(.+?)(?=(?:\s+(?:subscription|membership|bill|recharge|via|using|on)|$))/i,
        /credited to.*?(?:from|by)\s+(.+?)(?=(?:\s+(?:via|using|for|on)|$))/i
    ];

    for (const pattern of merchantPatterns) {
        const match = message.match(pattern);
        if (match && match[1]) {
            merchant = match[1].trim();
            break;
        }
    }

    if (!merchant || merchant.length === 0) merchant = 'Unknown';
    else merchant = merchant.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    // 5. Determine Category
    const categories = {
        Food: ['zomato', 'swiggy', 'kfc', 'mcdonalds', 'restaurant', 'cafe', 'dominos', 'pizza', 'burger', 'swiggy'],
        Travel: ['uber', 'ola', 'irctc', 'makemytrip', 'redbus', 'flight', 'train', 'ticket', 'metro', 'bus', 'rapido'],
        Shopping: ['amazon', 'flipkart', 'myntra', 'ajio', 'mall', 'store', 'reliance', 'bazaar', 'mart', 'supermarket', 'big bazaar'],
        Bills: ['electricity', 'water', 'recharge', 'jio', 'airtel', 'vi', 'bill', 'wifi', 'broadband', 'gas', 'rent'],
        Entertainment: ['bookmyshow', 'netflix', 'amazon prime', 'hotstar', 'cinema', 'movie', 'pvr', 'inox', 'spotify']
    };

    let category = 'Others';
    const lMerchant = merchant.toLowerCase();

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
            amount,
            merchant,
            app,
            category,
            type
        };
    }

    return null;
}
