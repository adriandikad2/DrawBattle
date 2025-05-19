# 🎨 Draw Battle! 🖌️

Draw Battle adalah sebuah aplikasi web multiplayer berbasis game di mana pemain dapat saling bertanding menggambar sesuai tema yang diberikan, lalu saling menilai hasil gambar satu sama lain. Lalu gambar dengan skor tertinggi akan memenangkan ronde tersebut.

---

## Fitur Utama
- **Buat & Gabung Room**: Pemain dapat membuat room baru atau bergabung ke room yang sudah ada.
- **Game Multiplayer**: Beberapa pemain dapat bermain bersama dalam satu room.
- **Voting & Penilaian**: Setelah sesi menggambar, pemain dapat memberikan penilaian pada gambar pemain lain.
- **Leaderboard**: Terdapat papan peringkat berdasarkan skor pemain.
- **Autentikasi**: Sistem login & register untuk menjaga keamanan akun.

---

## Frontend
Frontend dibangun menggunakan **React** dan **Vite** dengan dukungan **Tailwind CSS** untuk styling. Fitur utama pada frontend meliputi:
- Halaman login, register, home, lobby, drawing, voting, leaderboard, dan profil pengguna.
- Komponen interaktif seperti kanvas gambar, timer, room card, dan sistem rating bintang.
- Manajemen state menggunakan Context API.
- Komunikasi dengan backend melalui REST API.

Struktur folder utama frontend:
- `src/components/` : Komponen UI seperti Navbar, DrawingCanvas, RoomCard, dsb.
- `src/pages/` : Halaman-halaman utama aplikasi.
- `src/contexts/` : Context untuk autentikasi dan tema.
- `src/services/` : Koneksi ke API backend.
- `src/styles/` : File CSS khusus.

Untuk menjalankan frontend:
```bash
cd frontend
npm install
npm run dev
```

---

## Backend
Backend dibangun menggunakan **Node.js** dan **Express**. Fitur utama backend:
- Autentikasi JWT (login, register)
- Manajemen room & game (membuat, join, update status room)
- Penyimpanan gambar (integrasi dengan Cloudinary)
- Voting & perhitungan skor
- Koneksi ke database (menggunakan file `schema.sql` untuk struktur tabel)

Struktur folder utama backend:
- `routes/` : Routing untuk autentikasi, game, dan room.
- `middleware/` : Middleware seperti autentikasi JWT.
- `config/` : Konfigurasi database & Cloudinary.

Untuk menjalankan backend:
```bash
cd backend
npm install
node server.js
```

---
