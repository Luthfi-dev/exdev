const express = require("express");
const router = express.Router();
const db = require("../config/dbConfig");

// GET: Mendapatkan media dengan paginasi dan filter berdasarkan jenis (image atau video)
router.get("/api/media/user", (req, res) => {
  const page = req.query.page || 1;
  const itemsPerPage = 10;
  const offset = (page - 1) * itemsPerPage;
  const mediaType = req.query.type || "image";

  // Buat query SQL untuk menghitung jumlah total data yang sesuai dengan filter
  const countQuery = "SELECT COUNT(*) as total FROM media WHERE type = ?";

  db.query(countQuery, [mediaType], (countErr, countResult) => {
    if (countErr) {
      res.status(500).json({ error: countErr.message });
      return;
    }

    const totalCount = countResult[0].total; // Jumlah total data yang sesuai

    // Buat query SQL untuk mengambil data media berdasarkan halaman
    const query =
      "SELECT * FROM media WHERE type = ? ORDER BY id DESC LIMIT ?, ?";
    db.query(query, [mediaType, offset, itemsPerPage], (err, results) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      // Sertakan jumlah total dalam respons
      res.json({ data: results, total: totalCount });
    });
  });
});

module.exports = router;
