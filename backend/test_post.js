const test = async () => {
    try {
        const res = await fetch("http://localhost:5000/api/transactions/sms-webhook", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messageBody: "₹999 paid for Amazon Prime membership via Credit Card 123" })
        });
        const data = await res.json();
        console.log("Success:", data);
    } catch (e) {
        console.error("Error:", e);
    }
};
test();
