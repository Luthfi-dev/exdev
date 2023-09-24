const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("../config/dbConfig");

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "./public/media/"); // Menentukan folder untuk menyimpan file yang diunggah
  },
  filename: (req, file, callback) => {
    const fileExt = file.originalname.split(".").pop().toLowerCase();
    const type = fileExt === "mp4" ? "video" : "image"; // Menentukan tipe berdasarkan ekstensi
    callback(null, `${Date.now()}_${type}.${fileExt}`); // Menyimpan file dengan nama unik
  },
});

const upload = multer({ storage });

// GET: Mendapatkan semua media
// router.get("/api/media", (req, res) => {
//   db.query("SELECT * FROM media", (err, results) => {
//     if (err) {
//       res.status(500).json({ error: err.message });
//       return;
//     }
//     res.json(results);
//   });
// });

// GET: Mendapatkan media dengan paginasi dan filter berdasarkan jenis (image atau video)
router.get("/api/media", (req, res) => {
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

// POST: Upload multi files
router.post("/api/media", upload.array("nama"), (req, res) => {
  const user_id = req.body.user_id; // Dapatkan user_id dari permintaan jika ada

  if (!user_id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  const fotoFileNames = req.files.map((file) => file.filename);

  fotoFileNames.forEach((element, index) => {
    const fileExt = element.split(".").pop().toLowerCase();
    const type = fileExt === "mp4" ? "video" : "image"; // Tipe diambil dari ekstensi file
    db.query(
      "INSERT INTO media (nama, type, user_id, created_at) VALUES (?, ?, ?, NOW())",
      [element, type, user_id],
      (err, result) => {
        if (err) {
          // Hapus foto jika terjadi error
          req.files.forEach((file) => fs.unlinkSync(file.path));
          return res.status(500).json({ error: err.message });
        }

        if (index === fotoFileNames.length - 1) {
          // Jika ini adalah iterasi terakhir, kirim respon
          return res.json({
            message: "Media berhasil ditambahkan",
            id: result.insertId,
          });
        }
      }
    );
  });
});

// DELETE: Hapus media berdasarkan ID
router.delete("/api/media/:id", (req, res) => {
  const mediaId = req.params.id;

  // Cari nama file media berdasarkan ID
  db.query("SELECT nama FROM media WHERE id = ?", [mediaId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Media not found" });
    }

    const mediaFileName = results[0].nama;

    // Hapus file media dari sistem file
    const filePath = path.join(__dirname, "../public/media/", mediaFileName);
    fs.unlink(filePath, (err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to delete media file" });
      }

      // Hapus media dari database
      db.query("DELETE FROM media WHERE id = ?", [mediaId], (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        return res.json({ message: "Media berhasil dihapus" });
      });
    });
  });
});

module.exports = router;
