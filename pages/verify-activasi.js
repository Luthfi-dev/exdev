const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();
const dotenv = require("dotenv");
const db = require("../config/dbConfig");

dotenv.config();

const secretKey = process.env.RESET_TOKEN_SECRET;

router.post("/api/user/verify-activasi", (req, res) => {
  // Mendapatkan token dari permintaan HTTP (biasanya dari query string atau header)
  const token = req.headers.token; // Misalnya, jika token disimpan dalam query string
  console.log(token);
  // Memeriksa dan mendapatkan informasi dari token
  try {
    const decodedToken = jwt.verify(token, secretKey); // Pastikan secretKey sesuai dengan yang digunakan saat menghasilkan token
    const userEmail = decodedToken.email;
    const userPass = decodedToken.password;
    const userRole = decodedToken.role;
    console.log(userEmail, userPass, userRole);
    // ambil data dari db dab update status menjadi status
    db.query(
      "UPDATE users SET status='active' WHERE email=? AND password=? AND role=?",
      [userEmail, userPass, userRole],
      (err, result) => {
        if (err) {
          console.error("Error updating user status:", err);
          res.status(500).json({ message: "Gagal mengaktifkan akun" });
        } else {
          res.status(200).json({
            message: "Akun berhasil diaktifkan",
            email: userEmail,
            password: userPass,
            role: userRole,
          });
        }
      }
    );
  } catch (error) {
    console.error("Error verifying JWT token:", error);
    // Tangani kesalahan, misalnya, jika token tidak valid atau sudah kedaluwarsa.
    res
      .status(401)
      .json({ message: "Token tidak valid atau sudah kedaluwarsa" });
  }
});

module.exports = router;
