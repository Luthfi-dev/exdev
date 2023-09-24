// verify-mail.js

// Import paket nodemailer
const nodemailer = require("nodemailer");

// Konfigurasi transporter (sama seperti di app.js)

// Fungsi untuk mengirim email verifikasi
async function sendVerificationEmail(email, verificationLink) {
  try {
    // Kirim email
    await transporter.sendMail({
      from: "otp@thinkepic.luth.my.id", // Ganti dengan alamat email Anda
      to: email,
      subject: "Verifikasi Email",
      html: `
        <p>Silakan verifikasi alamat email Anda dengan mengklik tautan berikut:</p>
        <a href="${verificationLink}">${verificationLink}</a>
      `,
    });

    console.log(`Email verifikasi dikirim ke ${email}`);
  } catch (error) {
    console.error(`Gagal mengirim email verifikasi: ${error}`);
  }
}

module.exports = sendVerificationEmail; // Ekspor fungsi agar dapat digunakan di tempat lain
