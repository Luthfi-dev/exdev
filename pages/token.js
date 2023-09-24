const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const db = require("../config/dbConfig");

dotenv.config();

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
const resetTokenSecret = process.env.RESET_TOKEN_SECRET;

router.post("/api/token/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  console.log(email, password);
  // Proses autentikasi pengguna dengan database
  db.query(
    "SELECT * FROM users WHERE email = ? AND password = ?",
    [email, password],
    (err, results) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "Terjadi kesalahan dalam autentikasi" });
      }
      console.log(results);
      if (results.length === 0) {
        return res.status(401).json({ error: "Autentikasi gagal" });
      }

      const user = results[0];

      if (user.status !== "active") {
        return res.status(401).json({ error: "Akun non-aktif" });
      }

      const accessToken = jwt.sign({ email: user.email }, accessTokenSecret, {
        expiresIn: "1m",
      });
      const refreshToken = jwt.sign({ email: user.email }, refreshTokenSecret, {
        expiresIn: "2m",
      });

      res.json({ accessToken, refreshToken });
    }
  );
});

// Implementasi token reset
router.post("/api/token/reset", (req, res) => {
  const email = req.body.email;

  // Proses validasi pengguna dan buat token reset jika berhasil
  const resetToken = jwt.sign({ email }, resetTokenSecret, {
    expiresIn: "6h",
  });

  // Kirimkan token reset ke pengguna (misalnya, melalui email)

  res.json({ resetToken });
});

module.exports = router;
