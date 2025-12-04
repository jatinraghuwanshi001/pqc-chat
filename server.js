require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const cors = require("cors");

app.use(
  cors({
    origin: [
      "https://cryptoria-23fa5.web.app",   // Firebase domain
      "http://localhost:5173"              // local dev (optional)
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

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

// ✅ Test DB
db.connect()
  .then(() => console.log("✅ Supabase connected"))
  .catch((err) => console.error("❌ DB error:", err));


// ✅ API: Save User (on login/signup)
app.post("/api/users", async (req, res) => {
  try {
    const { uid, email, name, photoURL, pqcPublicKey } = req.body;

    await db.query(
      `
      INSERT INTO users (uid, email, name, photo_url, pqc_public_key)
      VALUES ($1,$2,$3,$4,$5)
      ON CONFLICT (uid)
      DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        photo_url = EXCLUDED.photo_url,
        pqc_public_key = EXCLUDED.pqc_public_key
      `,
      [uid, email, name, photoURL, pqcPublicKey]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("User save failed:", err);
    res.status(500).json({ error: "User save failed" });
  }
});


// ✅ API: List Users
app.get("/api/users", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT uid, email, name, photo_url as "photoURL", pqc_public_key as "pqcPublicKey"
      FROM users
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("List users failed:", err);
    res.status(500).json({ error: "User load failed" });
  }
});


// ✅ API: Store encrypted message
app.post("/api/send", async (req, res) => {
  try {
    const { chatId, sender, iv, ciphertext } = req.body;

    await db.query(
      "INSERT INTO messages (chat_id, sender, iv, ciphertext) VALUES ($1,$2,$3,$4)",
      [chatId, sender, iv, ciphertext]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Message insert failed:", err);
    res.status(500).json({ error: "DB error" });
  }
});


// ✅ API: Read messages
app.get("/api/messages/:chatId", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM messages WHERE chat_id=$1 ORDER BY created_at ASC",
      [req.params.chatId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Fetch failed:", err);
    res.status(500).json({ error: "DB error" });
  }
});


// ✅ Run server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});
