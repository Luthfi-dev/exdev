// app.js

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors"); // Import paket CORS
const nodemailer = require("nodemailer");
const cookieParser = require("cookie-parser");

const port = process.env.PORT || 9000;

// Middleware CORS - Izinkan semua asal (Origin) untuk pengembangan lokal
app.use(cors());
// { credentials: true, origin: "http://localhost:3000" }

// Middleware Body Parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Mengurai data JSON
app.use(cookieParser());

// req page
const mediaUser = require("./pages/media-user");
const artikel = require("./pages/artikel");
const getDataUser = require("./pages/getDataUser");
const kategori = require("./pages/kategori");
const komentar_review = require("./pages/komentar-review");
const artikelpage = require("./pages/artikelpage");
const media = require("./pages/media");
const token = require("./pages/token");
const cekMail = require("./pages/cek-email");
const user = require("./pages/user");
const notifikasi = require("./pages/notifikasi");
const login = require("./pages/login");
const signup = require("./pages/signup");
const Logout = require("./pages/logout");
const verify_activasi = require("./pages/verify-activasi");
const verifyToken = require("./verifyToken");
const verifyRole = require("./verifyRole");
const refreshToken = require("./pages/refresh_token");
const artikelUser = require("./pages/artikelUser");
const kategoriUser = require("./pages/kategoriUser");

// execution
// Impor dan gunakan rute media
app.use(getDataUser);
app.use(login);
app.use(signup);
app.use(cekMail);
app.use(artikelUser);
app.use(mediaUser);
app.use(kategoriUser);
app.use(verify_activasi);
app.get("/user/logout", Logout);
app.get("/user/refresh", verifyToken, refreshToken);
// app.use(refreshTokenMiddleware);
const mediaRouter = require("./pages/media_public");
app.use("/media", mediaRouter);
app.use(verifyRole(["admin", "super-admin"]), verifyToken, artikel);
app.use(
  verifyRole(["admin", "super-admin", "master-admin", "user"]),
  verifyToken,
  notifikasi
);
app.use(kategori);
app.use(artikelpage);
app.use(media);
app.use(token);
app.use(user);
app.use(komentar_review);

// Jalankan server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
