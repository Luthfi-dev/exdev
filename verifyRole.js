const jwt = require("jsonwebtoken");

const verifyRole = (allowedRoles) => {
  return (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    // Periksa apakah token ada
    if (!token) {
      return res
        .status(401)
        .json({ message: "Akses ditolak: Token tidak ada" });
    }

    try {
      // Decode token untuk mendapatkan payload
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); // Gantilah 'rahasia' dengan rahasia JWT Anda

      // Dapatkan role dari payload token
      const userRole = decoded.role;

      // Periksa apakah role pengguna ada dalam daftar role yang diizinkan
      if (allowedRoles.includes(userRole)) {
        // Role diizinkan, lanjutkan ke middleware berikutnya atau rute
        next();
        return res.status(200);
      } else {
        // Role tidak diizinkan, kirim kode respon akses dilarang
        return res
          .status(403)
          .json({ message: "Akses dilarang: Role tidak diizinkan" });
      }
    } catch (error) {
      // Handle kesalahan jika dekode token gagal
      return res
        .status(401)
        .json({ message: "Akses ditolak: Token tidak valid" });
    }
  };
};

module.exports = verifyRole;
