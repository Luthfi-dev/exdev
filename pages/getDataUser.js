const express = require("express");
const router = express.Router();
// const multer = require("multer"); // Library untuk menghandle upload file
// const path = require("path");
// const fs = require("fs");
const db = require("../config/dbConfig");

// GET: Mendapatkan semua users
router.get("/api/get/user", (req, res) => {
  const id = req.query.id;
  db.query(
    "SELECT email,nama FROM users WHERE id_user=?",
    [id],
    (err, results) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(results);
    }
  );
});

module.exports = router;
