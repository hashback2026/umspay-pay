const express = require("express");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

const API_KEY = process.env.API_KEY;

// Delay function
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

app.post("/send-stk", async (req, res) => {
    const { numbers, amount, reference } = req.body;

    if (!numbers || !amount || !reference) {
        return res.json({ success: false, message: "Missing fields" });
    }

    const numberList = numbers.split("\n").map(n => n.trim()).filter(n => n);

    let results = [];

    for (let number of numberList) {
        try {
            const response = await fetch("https://api.umspay.co.ke/api/v1/initiatestkpush", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    api_key: API_KEY,
                    msisdn: number,
                    amount: amount,
                    reference: reference
                })
            });

            const data = await response.json();

            results.push({
                number,
                status: "Sent",
                response: data
            });

            await delay(2000);

        } catch (error) {
            results.push({
                number,
                status: "Failed",
                error: error.message
            });
        }
    }

    res.json({ success: true, results });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
