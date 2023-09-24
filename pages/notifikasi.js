const express = require("express");
const router = express.Router();
const db = require("../config/dbConfig");

// GET: Mendapatkan semua notifikasi
// router.get("/api/notifikasi", (req, res) => {
//   db.query("SELECT * FROM notifikasi", (err, results) => {
//     if (err) {
//       res.status(500).json({ error: err.message });
//       return;
//     }
//     res.json(results);
//   });
// });

// GET: Mendapatkan satu notifikasi
router.get("/api/notifikasi", (req, res) => {
  const { user_id, isi_notifikasi, level, jumlah, status } = req.query;

  let queryValue;
  let queryParams = [];

  if (user_id) {
    queryValue =
      "SELECT * FROM notifikasi WHERE user_id=? ORDER BY created_at DESC";
    queryParams.push(user_id);
  } else if (isi_notifikasi) {
    queryValue =
      "SELECT * FROM notifikasi WHERE isi_notifikasi=? ORDER BY created_at DESC";
    queryParams.push(isi_notifikasi);
  } else if (level) {
    queryValue =
      "SELECT * FROM notifikasi WHERE level=? ORDER BY created_at DESC";
    queryParams.push(level);
  } else if (status) {
    queryValue =
      "SELECT * FROM notifikasi WHERE status=? ORDER BY created_at DESC";
    queryParams.push(status);
  } else {
    queryValue = "SELECT * FROM notifikasi ORDER BY created_at DESC";
  }

  if (jumlah) {
    // Menambahkan LIMIT ke dalam query jika jumlah ada
    queryValue += " LIMIT ?";
    queryParams.push(Number(jumlah)); // Mengonversi jumlah ke tipe numerik jika perlu
  }

  db.query(queryValue, queryParams, (err, results) => {
    if (err) {
      res.status(500).json({ message: "gagal mengambil data notifikasi", err });
      return;
    }
    res.json(results);
  });
});

// tambah notifikasi baru
router.post("/api/notifikasi", (req, res) => {
  console.log(req.body);
  const { isi_notifikasi, user_id, level, status } = req.body;

  db.query(
    "INSERT INTO notifikasi (isi_notifikasi, user_id, level, status, created_at) VALUES (?, ?, ?, ?, NOW())",
    [isi_notifikasi, user_id, level, status],
    (err, result) => {
      if (err) {
        // Hapus foto jika terjadi error
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({
        message: "notifikasi berhasil ditambahkan",
        id: result.insertId,
      });
    }
  );
});

// DELETE: Menghapus notifikasi
router.delete("/api/notifikasi/:id", (req, res) => {
  const id = req.params.id;
  db.query(
    "DELETE FROM notifikasi WHERE id_notifikasi = ?",
    [id],
    (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: "notifikasi berhasil dihapus", id: id });
    }
  );
});

module.exports = router;
