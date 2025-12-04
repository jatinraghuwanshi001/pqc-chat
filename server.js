require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Connect Supabase (Postgres)
const db = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
});

// ✅ Check DB connection
db.connect()
  .then(() => console.log("✅ Supabase connected"))
  .catch((err) => console.error("❌ DB error:", err));

// ✅ Store encrypted message
app.post("/api/send", async (req, res) => {
  try {
    const { chatId, sender, iv, ciphertext } = req.body;

    await db.query(
      "INSERT INTO messages (chat_id, sender, iv, ciphertext) VALUES ($1, $2, $3, $4)",
      [chatId, sender, iv, ciphertext]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

// ✅ Fetch messages
app.get("/api/messages/:chatId", async (req, res) => {
  try {
    const chatId = req.params.chatId;

    const result = await db.query(
      "SELECT * FROM messages WHERE chat_id=$1 ORDER BY created_at ASC",
      [chatId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});
