const express = require("express");
const router = express.Router();
const db = require("../config/dbConfig");

router.get("/api/artikelpage", (req, res) => {
  const page = req.query.page || 1;
  let itemsPerPage = parseInt(req.query.jumlah, 10);
  const offset = (page - 1) * itemsPerPage;
  const searchQuery = req.query.search; // Parameter pencarian
  const statusQuery = req.query.status;
  // ambil artikel by id
  const idQuery = req.query.id;
  // const idUserQuery = req.query.id_user;

  // Buat query SQL untuk menghitung jumlah total data yang sesuai dengan filter
  let countQuery = "SELECT COUNT(*) as total FROM artikel";

  // Buat query SQL untuk mengambil data media berdasarkan halaman dan filter pencarian
  let query = "SELECT * FROM artikel";

  const queryParams = []; // Array untuk menyimpan parameter query dinamis

  if (searchQuery && !statusQuery) {
    // Jika parameter pencarian ada, tambahkan filter pencarian ke query
    countQuery += " WHERE judul LIKE ?";
    query += " WHERE judul LIKE ?";
    queryParams.push(`%${searchQuery}%`); // Tambahkan wildcard % untuk mencocokkan bagian apa pun dari judul yang mengandung kata kunci
  }

  if (statusQuery && !searchQuery) {
    // Jika parameter pencarian ada, tambahkan filter pencarian ke query
    countQuery += " WHERE status = ?";
    query += " WHERE status = ?";
    queryParams.push(`${statusQuery}`);
  }

  if (statusQuery && searchQuery) {
    // Jika parameter pencarian ada, tambahkan filter pencarian ke query
    countQuery += " WHERE status = ? AND judul LIKE ?";
    query += " WHERE status = ? AND judul LIKE ?";
    queryParams.push(`${statusQuery}`, `%${searchQuery}%`);
  }

  // if (idQuery) {
  //   // Jika parameter pencarian ada, tambahkan filter pencarian ke query
  //   countQuery += " WHERE id = ?";
  //   query += " WHERE id = ?";
  //   queryParams.push(`${idQuery}`);
  // }

  if (idQuery) {
    if (queryParams.length > 0) {
      // Jika sudah ada kondisi WHERE sebelumnya, gabungkan dengan "AND"
      countQuery += " AND user_id = ?";
      query += " AND user_id = ?";
    } else {
      // Jika belum ada kondisi WHERE sebelumnya, tambahkan "WHERE"
      countQuery += " WHERE user_id = ?";
      query += " WHERE user_id = ?";
    }
    queryParams.push(`${idQuery}`);
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
