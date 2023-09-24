const jwt = require("jsonwebtoken");
const db = require("./config/dbConfig");

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        // Token akses kadaluwarsa, periksa token refresh di database
        const userId = decoded.id_user; // Ubah sesuai dengan nama yang sesuai dalam token
        const result = await db.query(
          "SELECT refresh_token FROM users WHERE id_user = ?",
          [userId]
        );

        if (result && result.length > 0) {
          const refreshToken = result[0].refresh_token;
          jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            (err, decodedRefresh) => {
              if (err) {
                // Token refresh tidak valid
                return res.sendStatus(401);
              }

              // Token refresh valid, buat token akses baru
              const newAccessToken = jwt.sign(
                { id_user: decodedRefresh.id_user },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: "1m" } // Atur waktu kadaluwarsa token akses yang baru
              );

              // Kirim token akses baru ke klien dalam respons
              res.json({ accessToken: newAccessToken });

              // Setel header otorisasi dengan token akses yang baru
              req.headers["authorization"] = `Bearer ${newAccessToken}`;

              // Lanjutkan dengan akses ke halaman
              next();
            }
          );
        } else {
          // Jika data token refresh tidak ditemukan di database
          return res.sendStatus(401);
        }
      } else {
        // Kesalahan verifikasi token akses lainnya
        return res.sendStatus(401);
      }
    } else {
      // Token akses masih valid, lanjutkan dengan akses ke halaman
      next();
    }
  });
};

module.exports = verifyToken;
