const express = require("express");
const router = express.Router();
const db = require("../config/dbConfig");

// GET: Mendapatkan semua komentar-review
router.get("/api/komentar-review", (req, res) => {
  db.query("SELECT * FROM komentar_review", (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

// GET: Mendapatkan satu komentar-review
router.get("/api/komentar-review-cek", (req, res) => {
  const { id_artikel } = req.query.id_artikel;
  db.query(
    "SELECT * FROM komentar_review WHERE id_artikel=?",
    [id_artikel],
    (err, results) => {
      if (err) {
        res.status(500).json(false);
        return;
      }
      res.json(true);
    }
  );
});

// tambah komentar-review baru
router.post("/api/komentar-review", (req, res) => {
  console.log(req.body);
  const { isi, id_artikel, penulis, editor } = req.body;

  db.query(
    "INSERT INTO komentar_review (isi,id_artikel,penulis,editor, created_at) VALUES (?, ?, ?, NOW())",
    [isi, id_artikel, penulis, editor],
    (err, result) => {
      if (err) {
        // Hapus foto jika terjadi error
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({
        message: "komentar review berhasil ditambahkan",
        id: result.insertId,
      });
    }
  );
});

// DELETE: Menghapus komentar-review
router.delete("/api/komentar-review/:id", (req, res) => {
  const id = req.params.id;
  db.query(
    "DELETE FROM komentar_review WHERE id_komentar_review = ?",
    [id],
    (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: "komentar review berhasil dihapus", id: id });
    }
  );
});

module.exports = router;
