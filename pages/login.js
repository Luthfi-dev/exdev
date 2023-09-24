// login.js

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");
const db = require("../config/dbConfig");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const { serialize } = require("cookie");
const sendVerificationEmail = require("./send-mail");
const { generateEmailVerificationToken } = require("./token_activasi");

dotenv.config();

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
const resetTokenSecret = process.env.RESET_TOKEN_SECRET;

router.post("/api/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const role = req.body.role;
  // console.log(email, password, role);
  // Proses autentikasi pengguna dengan database
  db.query(
    "SELECT * FROM users WHERE email = ? AND role= ?",
    [email, role],
    async (err, results) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "Terjadi kesalahan dalam autentikasi" });
      }

      if (results.length === 0) {
        return res.status(401).json({ error: "Autentikasi gagal" });
      }

      const user = results[0];

      // Menggunakan bcrypt untuk memverifikasi password
      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        return res.status(401).json({ error: "Autentikasi gagal" });
      }

      if (user.status !== "active") {
        return res.status(401).json({ error: "Akun non-aktif" });
      }

      const accessToken = jwt.sign(
        {
          id_user: user.id_user,
          email: user.email,
          nama: user.nama,
          role: user.role,
        },
        accessTokenSecret,
        {
          expiresIn: "15",
        }
      );
      const refreshToken = jwt.sign(
        {
          id_user: user.id_user,
          email: user.email,
          nama: user.nama,
          role: user.role,
        },
        refreshTokenSecret,
        {
          expiresIn: "7d",
        }
      );

      res.cookie("refreshToken", refreshToken, {
        sameSite: "none", // Atur sesuai dengan domain client
        path: "/", // Tentukan jalur di mana cookie berlaku
        secure: true, // Layani cookie hanya melalui HTTPS
        httpOnly: true, // Cegah JavaScript mengakses cookie
        maxAge: 24 * 60 * 60 * 1000, // Atur tanggal kedaluwarsa
      });

      // res.cookie("refreshToken", refreshToken, {
      //   httpOnly: true,
      //   sameSite: "none",
      //   // secure: true,
      //   maxAge: 24 * 60 * 60 * 1000,
      //   path: "/",
      // });

      // const serialized = serialize("refreshToken", refreshToken, {
      //   httpOnly: true,
      //   // secure: process.env.NODE_ENV === "production",
      //   sameSite: "none",
      //   maxAge: 60 * 60 * 24 * 30,
      //   path: "/",
      // });
      // res.setHeader("Set-Cookie", serialized);

      // koneksi ke db tb users lalu update kolom refresh_token = refreshToken
      db.query(
        "UPDATE users SET refresh_token = ? WHERE id_user = ?",
        [refreshToken, user.id_user],
        (updateErr, updateResult) => {
          if (updateErr) {
            // Tangani kesalahan jika gagal melakukan update ke database
            return res.status(500).json({
              error: "Terjadi kesalahan dalam mengupdate refreshToken",
            });
          }

          // Jika update ke database berhasil, kirimkan respons ke client
          res.json({ accessToken, refreshToken });
        }
      );
    }
  );
});

module.exports = router;
