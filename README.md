# WhatsApp_Message_Sender

## Project Overview

This project is a backend-based WhatsApp messaging system built using Node.js, Twilio Sandbox, and MySQL.
It allows you to:

* Create campaigns via API
* Automatically send a WhatsApp message once a campaign is created
* Receive replies from users
* Store replies in a MySQL database
* Track message status using webhooks

This is a prototype/demo system for learning automation, API integration, and backend development.

---

## Tech Stack

* Node.js (Express.js)
* MySQL
* Twilio WhatsApp Sandbox
* ngrok (for webhook testing)

---

## Project Structure

```
Message_Whatsapp/
│
├── server.js
├── .env
├── package.json
└── README.md
```

---

## Installation & Setup

### Clone or Download Project

Place the project in:

```
F:\Node.js\Message_Whatsapp
```

---

### Install Dependencies

```
npm install express body-parser twilio mysql2 dotenv
```

### Setup MySQL Database

Create a database:

```
CREATE DATABASE whatsapp_bulk;
USE whatsapp_bulk;
```

Create tables:

```
CREATE TABLE campaigns (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  message TEXT,
  duration_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE replies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  phone VARCHAR(50),
  message TEXT,
  received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### Configure Environment Variables

Create a `.env` file:

```
TWILIO_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
```

Get these from Twilio Dashboard → Account Info.

---

### Join Twilio WhatsApp Sandbox

From your personal WhatsApp:

Send the join code to:

```
+1 415 523 8886
```

Example:

```
join happy-sky
```

---

### Start Server

```
node server.js
```

You should see:

```
Server running at port 3001
```
<img width="1155" height="997" alt="image" src="https://github.com/user-attachments/assets/483f2a8a-359f-4ca3-9579-6db475d50d88" />

---

## API Endpoints

### Health Check

```
GET /
```

Response:

```
WhatsApp Bulk System Running
```

---

### Create Campaign & Send WhatsApp

```
POST /campaign
```

Body (JSON):

```
{
  "user_id": 1,
  "message": "Hello from Twilio",
  "duration_type": "instant"
}
```

What happens:

1. Campaign saved in MySQL
2. WhatsApp message sent once
3. Response returned with campaign ID

---

### Receive Replies (Webhook)

```
POST /webhook
```

Automatically called by Twilio when a user replies.

Replies stored in:

```
replies table
```

---

### View Replies

```
GET /replies
```

Returns all stored replies.

---

## Webhook Setup (Using ngrok)

Start ngrok:

```
ngrok http 3001
```

Copy HTTPS URL and set in Twilio Sandbox:

**When a message comes in**

```
https://your-ngrok-url/webhook
```

**Status callback**

```
https://your-ngrok-url/status
```

---

## Testing with Postman

Send POST request:

```
http://localhost:3001/campaign
```

Body:

```
{
  "user_id": 1,
  "message": "Communication Succesfull",
  "duration_type": "instant"
}
```

You should receive the message on your WhatsApp.
<img width="738" height="1600" alt="image" src="https://github.com/user-attachments/assets/8f684d59-b02c-4568-9558-064a6e2bd3e6" />

---

## Features

* Send WhatsApp message using Twilio API
* Save campaign data in MySQL
* Receive & store replies
* Webhook integration
* Status tracking ready
* Simple API-based architecture

---

## Future Improvements

* Send to multiple contacts
* CSV contact upload
* Campaign scheduling
* AI auto-reply bot
* Message analytics

