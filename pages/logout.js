// pages/logout.js

const express = require("express");
const router = express.Router();
const db = require("../config/dbConfig");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const Logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    console.log(refreshToken);

    if (!refreshToken) {
      return res.sendStatus(204);
    }

    // Gunakan `db.query` untuk mencari user dengan refresh_token yang sesuai
    db.query(
      "SELECT * FROM users WHERE refresh_token = ?",
      [refreshToken],
      async (err, results) => {
        if (err) {
          return res.sendStatus(403);
        }

        const user = results[0];
        if (!user) {
          return res.sendStatus(204);
        }

        // koneksi ke db tb users lalu update kolom refresh_token = refreshToken
        db.query(
          "UPDATE users SET refresh_token = '' WHERE id_user = ?",
          [user.id_user],
          (updateErr, updateResult) => {
            if (updateErr) {
              // Tangani kesalahan jika gagal melakukan update ke database
              return res.status(500).json({
                error: "Terjadi kesalahan dalam mengupdate refreshToken",
              });
            }

            // Jika update ke database berhasil, kirimkan respons ke client
            res.json({ message: "berhasil logout" });
          }
        );
      }
    );

    res.clearCookie("refreshToken");
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

module.exports = Logout;
