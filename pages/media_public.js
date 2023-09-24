// pages/media_public.js
const express = require("express");
const router = express.Router();
const path = require("path");

// Menangani permintaan media berdasarkan nama berkas
router.get("/:filename", (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, "../public/media", filename); // Membuat path lengkap ke berkas media

  res.sendFile(filePath);
});

module.exports = router;
