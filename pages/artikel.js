const express = require("express");
const router = express.Router();
// const multer = require("multer"); // Library untuk menghandle upload file
// const path = require("path");
// const fs = require("fs");
const db = require("../config/dbConfig");

// GET: Mendapatkan semua artikel
router.get("/api/artikel", (req, res) => {
  db.query("SELECT * FROM artikel", (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

// tambah artikel baru
router.post("/api/artikel", (req, res) => {
  console.log(req.body);
  const {
    id,
    judul,
    type_konten,
    media,
    kategori,
    isi,
    tags,
    editor,
    slug,
    user_id,
    status,
  } = req.body;

  db.query(
    "INSERT INTO artikel (id, judul, type_konten, media, kategori, isi, tags, slug, user_id, editor, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())",
    [
      id,
      judul,
      type_konten,
      media,
      kategori,
      isi,
      tags,
      slug,
      user_id,
      editor,
      status,
    ],
    (err, result) => {
      if (err) {
        // Hapus foto jika terjadi error
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({
        message: "artikel berhasil ditambahkan",
        id: result.insertId,
      });
    }
  );
});

// PUT: Memperbarui artikel
router.put("/api/artikel/:id", (req, res) => {
  const id = req.params.id;
  const {
    judul,
    media,
    type_konten,
    kategori,
    isi,
    tags,
    slug,
    user_id,
    status,
  } = req.body;

  db.query(
    "UPDATE artikel SET judul = ?, type_konten = ?, media = ?, kategori= ?, isi= ?, tags= ?, slug= ?, user_id= ?, status= ?, updated_at=NOW() WHERE id = ?",
    [judul, type_konten, media, kategori, isi, tags, slug, user_id, status, id],
    (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: "artikel berhasil diperbarui", id: id });
    }
  );
});

// PUT: Memperbarui artikel
router.put("/api/artikel/status/:id", (req, res) => {
  const id = req.params.id;
  const { status } = req.body;

  db.query(
    "UPDATE artikel SET status= ?, updated_at=NOW() WHERE id = ?",
    [status, id],
    (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: "artikel berhasil diperbarui", id: id });
    }
  );
});

// DELETE: Menghapus artikel
router.delete("/api/artikel/:id", (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM artikel WHERE id = ?", [id], (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: "artikel berhasil dihapus", id: id });
  });
});

module.exports = router;
