const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");
const db = require("../config/dbConfig");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const sendVerificationEmail = require("./send-mail");
const { generateEmailVerificationToken } = require("./token_activasi");

dotenv.config();

// Konfigurasi multer untuk menghandle upload gambar
const storage = multer.diskStorage({
  destination: "./public/media/avatar",
  filename: (req, file, callback) => {
    const extname = path.extname(file.originalname);
    callback(null, Date.now() + extname);
  },
});

const upload = multer({ storage });

global.linkVerifyMail = process.env.MYAPPLINK;

// Endpoint untuk menambahkan pengguna baru
router.post("/api/signup", upload.single("img"), async (req, res) => {
  const { email, nama, password, status, role } = req.body;
  const img = req.file ? req.file.filename : null; // Mengambil nama gambar jika ada

  // Menggunakan bcrypt untuk mengenkripsi password
  const hashedPassword = await bcrypt.hash(password, 10);

  const userData = {
    email,
    nama,
    password: hashedPassword,
    status,
    role,
    img,
  };

  const sqlInsert = "INSERT INTO users SET ?";

  db.query(sqlInsert, userData, async (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: "Gagal menyimpan data ke database" });
    } else {
      if (userData.role !== "super-admin" || userData.role !== "master-admin") {
        // Setelah pengguna berhasil mendaftar, panggil fungsi sendVerificationEmail
        const token_verifikasi = generateEmailVerificationToken(
          userData.email,
          userData.password,
          userData.role
        );
        console.log(token_verifikasi);
        const verificationLink = `${linkVerifyMail}?token=${token_verifikasi}`;

        let send_mail;
        try {
          await sendVerificationEmail(userData.email, verificationLink);
          send_mail = true;
        } catch (error) {
          send_mail = false;
        }
      } else {
        send_mail = "tidak ada email verifikasi untuk admin super dan master";
      }

      res.status(200).json({
        message: "Data berhasil disimpan",
        id: result.insertId,
        send_mail: send_mail,
        email_user: userData.email,
      });
    }
  });
});

module.exports = router;
