const express = require("express");
const router = express.Router();
const db = require("../config/dbConfig");

router.get("/api/artikelUser", (req, res) => {
  const page = req.query.page || 1;
  let itemsPerPage = 10;
  const offset = (page - 1) * itemsPerPage;
  const searchQuery = req.query.search; // Parameter pencarian
  const statusQuery = req.query.status;
  const typeQuery = req.query.type;
  const kategoriQuery = req.query.kategori;
  // ambil artikel by id
  const idQuery = req.query.id;
  const slug = req.query.slug;
  // const idUserQuery = req.query.id_user;
  const apiKey = req.query.api_key;

  // Verifikasi API key
  if (apiKey !== "jdfgskdgfskdgffrfgr-fdjfgsdgfshd") {
    res.status(401).json({ error: "API key tidak valid" });
    return;
  }

  // Buat query SQL untuk menghitung jumlah total data yang sesuai dengan filter
  let countQuery = "SELECT COUNT(*) as total FROM artikel";

  // Buat query SQL untuk mengambil data media berdasarkan halaman dan filter pencarian
  let query = "SELECT * FROM artikel";

  const queryParams = []; // Array untuk menyimpan parameter query dinamis
  let whereAdded = false; // Untuk melacak apakah klausa WHERE sudah ditambahkan

  if (searchQuery) {
    // Jika parameter pencarian ada, tambahkan filter pencarian ke query
    query += whereAdded ? " AND" : " WHERE";
    query += " judul LIKE ?";
    queryParams.push(`%${searchQuery}%`); // Tambahkan wildcard % untuk mencocokkan bagian apa pun dari judul yang mengandung kata kunci
    whereAdded = true;
  }

  if (statusQuery) {
    // Jika parameter status ada, tambahkan filter status ke query
    query += whereAdded ? " AND" : " WHERE";
    query += " status = ?";
    queryParams.push(`${statusQuery}`);
    whereAdded = true;
  }

  if (idQuery) {
    // Jika parameter id ada, tambahkan filter id ke query
    query += whereAdded ? " AND" : " WHERE";
    query += " user_id = ?";
    queryParams.push(`${idQuery}`);
    whereAdded = true;
  }

  if (typeQuery) {
    // Jika parameter type ada, tambahkan filter type ke query
    query += whereAdded ? " AND" : " WHERE";
    query += " type_konten = ?";
    queryParams.push(`${typeQuery}`);
  }

  if (kategoriQuery) {
    // Jika parameter type ada, tambahkan filter type ke query
    query += whereAdded ? " AND" : " WHERE";
    query += " kategori= ?";
    queryParams.push(`${kategoriQuery}`);
  }

  if (slug) {
    // Jika parameter type ada, tambahkan filter type ke query
    query += whereAdded ? " AND" : " WHERE";
    query += " slug= ?";
    queryParams.push(`${slug}`);
  }

  db.query(countQuery, queryParams, (countErr, countResult) => {
    if (countErr) {
      res.status(500).json({ error: countErr.message });
      return;
    }

    const totalCount = countResult[0].total; // Jumlah total data yang sesuai

    // Tambahkan pengaturan paginasi ke query jika itemsPerPage tidak kosong
    if (!isNaN(itemsPerPage) && itemsPerPage > 0) {
      query += " ORDER BY created_at DESC LIMIT ?, ?";
      queryParams.push(offset, itemsPerPage);
    }

    db.query(query, queryParams, (err, results) => {
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
