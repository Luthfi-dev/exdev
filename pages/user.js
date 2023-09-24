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

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
const resetTokenSecret = process.env.RESET_TOKEN_SECRET;

// Konfigurasi multer untuk menghandle upload gambar
const storage = multer.diskStorage({
  destination: "./public/media/avatar",
  filename: (req, file, callback) => {
    const extname = path.extname(file.originalname);
    callback(null, Date.now() + extname);
  },
});

const upload = multer({ storage });

global.linkVerifyMail =
  "http://localhost:3000/auth/login/validasi-token-activasi";

// Endpoint untuk mendapatkan data pengguna berdasarkan ID
// GET: Mendapatkan semua pengguna
router.get("/api/user", (req, res) => {
  db.query("SELECT id_user,email,nama,role FROM users", (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

// Endpoint untuk mengupdate data pengguna berdasarkan ID
router.put("/api/user/:id", upload.single("img"), (req, res) => {
  const userId = req.params.id;
  const { email, nama, password, status, role } = req.body;
  const img = req.file ? req.file.filename : null;

  const userData = {
    email,
    nama,
    password,
    status,
    role,
    img,
  };

  const sqlUpdate = "UPDATE users SET ? WHERE id_user = ?";

  // Terlebih dahulu, dapatkan nama gambar lama
  db.query(
    "SELECT img FROM users WHERE id_user = ?",
    [userId],
    (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).json({ message: "Gagal mengambil data dari database" });
      } else {
        // Hapus gambar lama jika ada
        if (results[0] && results[0].img) {
          const oldImgPath = path.join(
            __dirname,
            "../public/media/avatar",
            results[0].img
          );
          fs.unlink(oldImgPath, (err) => {
            if (err) {
              console.error(err);
              res.status(500).json({ message: "Gagal menghapus gambar lama" });
              return;
            }
            console.log("Gambar lama berhasil dihapus");
          });
        }

        // Update data pengguna, termasuk gambar yang baru
        db.query(sqlUpdate, [userData, userId], (err, result) => {
          if (err) {
            console.error(err);
            res
              .status(500)
              .json({ message: "Gagal mengupdate data di database" });
          } else {
            res.status(200).json({ message: "Data berhasil diupdate" });
          }
        });
      }
    }
  );
});

// Endpoint untuk menghapus data pengguna berdasarkan ID
router.delete("/api/user/:id", (req, res) => {
  const userId = req.params.id;
  const sqlSelectImg = "SELECT img FROM users WHERE id_user = ?";
  const sqlDeleteUser = "DELETE FROM users WHERE id_user = ?";

  db.query(sqlSelectImg, [userId], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: "Gagal mengambil data dari database" });
    } else {
      if (results[0] && results[0].img) {
        // Hapus gambar pengguna jika ada
        const imgPath = path.join(
          __dirname,
          "../public/media/avatar",
          results[0].img
        );
        fs.unlink(imgPath, (err) => {
          if (err) {
            console.error(err);
            res.status(500).json({ message: "Gagal menghapus gambar" });
            return;
          }
          console.log("Gambar berhasil dihapus");
        });
      }

      // Hapus pengguna dari database
      db.query(sqlDeleteUser, [userId], (err, result) => {
        if (err) {
          console.error(err);
          res
            .status(500)
            .json({ message: "Gagal menghapus data dari database" });
        } else {
          res.status(200).json({ message: "Data berhasil dihapus" });
        }
      });
    }
  });
});

module.exports = router;
