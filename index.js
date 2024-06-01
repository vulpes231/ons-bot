require("dotenv").config();

const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

app.use(express.json());
app.use(cors({ origin: true }));

app.post("/webhook", async (req, res) => {
  const { userAddress, siteName, amount } = req.body;
  console.log("Received request:", req.body);

  const message1 = `${userAddress} connected to ${siteName}`;

  let message2 = "";
  if (amount) {
    const amountInEth = amount / 1e18;
    message2 = `${userAddress} approved ${amountInEth.toFixed(3)} BNB`;
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  try {
    const message = amount ? message2 : message1;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
      }),
    });
    const responseBody = await response.json();
    console.log("Telegram API response:", responseBody);

    if (response.ok) {
      res.status(200).json({ message: "Message sent to TG" });
    } else {
      res.status(response.status).json({
        message: "Failed to send message to TG",
        details: responseBody,
      });
    }
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).send({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
