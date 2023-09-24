const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const secretKey = process.env.RESET_TOKEN_SECRET;

// Fungsi untuk menghasilkan token verifikasi email
function generateEmailVerificationToken(email, password, role) {
  try {
    // Anda dapat menentukan payload sesuai kebutuhan Anda
    const payload = {
      email: email,
      password: password,
      role: role,
    };

    // Membuat token verifikasi email dengan berdasarkan payload dan kunci rahasia
    const token = jwt.sign(payload, secretKey, { expiresIn: "6h" }); // Token berlaku selama 6 jam
    console.log(token);
    return token;
  } catch (error) {
    console.error("Error generating JWT token:", error);
    throw error; // Anda dapat memilih untuk melempar kembali kesalahan atau menanganinya sesuai kebutuhan Anda.
  }
}

module.exports = { generateEmailVerificationToken };
