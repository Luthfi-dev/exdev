// pages/refresh_token.js

const express = require("express");
const router = express.Router();
const db = require("../config/dbConfig");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    console.log(refreshToken);

    if (!refreshToken) {
      return res.json({ message: "token kosong" });
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

        jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET,
          (err, decoded) => {
            if (err) {
              return res.sendStatus(403);
            }

            const id_user = user.id_user;
            const name = user.nama;
            const email = user.email;
            const role = user.role;

            const accessToken = jwt.sign(
              { id_user, name, email, role },
              process.env.ACCESS_TOKEN_SECRET,
              { expiresIn: "20s" }
            );

            res.json({ accessToken, id_user, name, email, role });
          }
        );
      }
    );
  } catch (error) {
    console.error(error);
    res.sendStatus(500); // Tangani kesalahan server
  }
};

module.exports = refreshToken;
