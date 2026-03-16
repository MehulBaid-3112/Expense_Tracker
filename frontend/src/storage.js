const API_URL = 'http://localhost:5000/api/transactions';

export async function getTransactions() {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Failed to fetch');
        return await res.json();
    } catch (err) {
        console.error('API Error:', err);
        return [];
    }
}

export async function saveTransaction(transaction) {
    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transaction)
        });
        if (!res.ok) throw new Error('Failed to save');
        return await res.json();
    } catch (err) {
        console.error('API Error:', err);
        return null;
    }
}

export async function deleteTransaction(id) {
    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Failed to delete');
        return await res.json();
    } catch (err) {
        console.error('API Error:', err);
        return null;
    }
}

export async function processSMSWeb(message) {
    try {
        const res = await fetch(`${API_URL}/sms-webhook`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messageBody: message })
        });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || 'Failed to process');
        }
        return await res.json();
    } catch (err) {
        throw err;
    }
}
