const express = require("express");
const router = express.Router();
// const multer = require("multer"); // Library untuk menghandle upload file
// const path = require("path");
// const fs = require("fs");
const db = require("../config/dbConfig");

// GET: Mendapatkan semua kategori
router.get("/api/kategori", (req, res) => {
  db.query("SELECT * FROM kategori", (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

module.exports = router;
