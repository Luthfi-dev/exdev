const express = require("express");
const router = express.Router();
const db = require("../config/dbConfig");

// / GET: Mendapatkan semua artikel
router.get("/api/user/cek-mail", (req, res) => {
  const email = req.query.email;
  const role = req.query.role;

  db.query(
    "SELECT * FROM users WHERE email=? AND role=?",
    [email, role],
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
