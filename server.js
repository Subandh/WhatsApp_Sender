// server.js
require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const twilio = require("twilio");
const mysql = require("mysql2/promise");

console.log("SERVER FILE PATH:", __filename);

const app = express();

// You can use either bodyParser or express.json; keeping both won't break,
// but this is clean enough:
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// -----------------------
// MySQL Connection
// -----------------------
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "whatsapp_bulk",
  port: 3306
});

// -----------------------
// Twilio Client
// -----------------------
const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const FROM_WHATSAPP = "whatsapp:+14155238886"; // Twilio Sandbox number
const TO_WHATSAPP = "whatsapp:+917488453771";  // Your joined sandbox number

// -----------------------
// Health Check
// -----------------------
app.get("/", (req, res) => {
  res.send("WhatsApp Bulk System Running 🚀");
});

// -----------------------
// Create Campaign + Send WhatsApp ONCE
// -----------------------
app.post("/campaign", async (req, res) => {
  const { user_id, message, duration_type } = req.body;

  // Validate
  if (!user_id || !message) {
    return res.status(400).json({ error: "user_id and message are required" });
  }

  try {

    const [result] = await db.execute(
      "INSERT INTO campaigns (user_id, message, duration_type) VALUES (?, ?, ?)",
      [user_id, message, duration_type || "instant"]
    );
    console.log("DB OK, campaign_id =", result.insertId);
    console.log("About to send WhatsApp via Twilio...");

    const tw = await client.messages.create({
      from: FROM_WHATSAPP,
      to: TO_WHATSAPP,
      body: message
    });

    console.log("Twilio sent! SID =", tw.sid, "status =", tw.status);

    return res.json({
      campaign_id: result.insertId,
      status: "Campaign Created + Twilio Sent",
      twilio_sid: tw.sid
    });

  } catch (err) {
    console.error("SEND FAILED:");
    console.error("message:", err.message);
    console.error("code:", err.code);
    console.error("status:", err.status);
    console.error("moreInfo:", err.moreInfo);

    return res.status(500).json({ error: err.message, code: err.code });
  }
});

app.post("/webhook", async (req, res) => {
  try {
    const incomingMsg = req.body.Body;
    const from = req.body.From;

    await db.execute(
      "INSERT INTO replies (phone, message) VALUES (?, ?)",
      [from, incomingMsg]
    );

    console.log("Reply Saved:", from, incomingMsg);
    res.send("<Response></Response>");
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.post("/status", async (req, res) => {
  try {
    const status = req.body.MessageStatus;
    const to = req.body.To;

    console.log("Status Callback:", { to, status });

    res.sendStatus(200);
  } catch (err) {
    console.error("FULL ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/replies", async (req, res) => {
  const [rows] = await db.execute(
    "SELECT * FROM replies ORDER BY received_at DESC"
  );
  res.json(rows);
});

app.get("/analytics/:campaign_id", async (req, res) => {
  const { campaign_id } = req.params;

  const [total] = await db.execute(
    "SELECT COUNT(*) as total FROM message_logs WHERE campaign_id = ?",
    [campaign_id]
  );

  const [delivered] = await db.execute(
    "SELECT COUNT(*) as delivered FROM message_logs WHERE campaign_id = ? AND status = 'delivered'",
    [campaign_id]
  );

  const [failed] = await db.execute(
    "SELECT COUNT(*) as failed FROM message_logs WHERE campaign_id = ? AND status = 'failed'",
    [campaign_id]
  );

  res.json({
    total_sent: total[0].total,
    delivered: delivered[0].delivered,
    failed: failed[0].failed
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});
