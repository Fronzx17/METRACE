# ⚡ METRACE — Personal Time Analytics & Time Fingerprint

> *"Your Time. Your Patterns. Your Story."*

**METRACE** adalah aplikasi web analitik waktu pribadi modern yang dirancang untuk membantu pengguna melacak, menganalisis, dan memahami pola alokasi waktu mereka. Dilengkapi fitur inovasi utama **Time Fingerprint**, METRACE memvisualisasikan kebiasaan unik pengguna dalam bentuk sidik jari digital dan grafik radar multi-dimensi.

---

## ✨ Fitur Utama

### 1. 🔐 Autentikasi Pengguna & Keamanan Data
- Registrasi, Login, dan Lupa Sandi terintegrasi dengan **Supabase Auth**.
- Keamanan tingkat database menggunakan **Row Level Security (RLS)** pada PostgreSQL: pengguna hanya dapat membaca, menambah, mengubah, dan menghapus data miliknya sendiri.
- Proteksi route client-side dengan `ProtectedRoute` dan `PublicRoute`.

### 2. 📝 Manajemen Aktivitas (Full CRUD)
- **Tambah, Lihat, Edit, dan Hapus** aktivitas harian dengan dialog konfirmasi aman.
- Filter multi-kategori dan pencarian instan berdasarkan judul atau catatan aktivitas.
- Filter berdasarkan tanggal spesifik.
- Mendukung 8 kategori aktivitas:
  - 📚 Belajar
  - 💼 Kerja
  - 🏃 Olahraga
  - 🎮 Hiburan
  - 😴 Istirahat
  - 👥 Sosial
  - 🧘 Pribadi
  - 📌 Lainnya

### 3. 📊 Dashboard Dinamis Real-Time
- Statistik waktu nyata: Total durasi tercatat, total jumlah aktivitas, kategori paling dominan, dan hari paling produktif.
- Grafik batang mingguan (*Weekly Activity Chart*) berbasis data riil per hari.
- Distribusi waktu kategori (*Pie Chart*) dengan persentase otomatis.
- Daftar aktivitas terbaru (*Recent Activities*).
- Rekomendasi dan insight produktivitas mingguan otomatis.

### 4. 📅 Timeline Kronologis
- Tampilan aktivitas berurutan secara kronologis dikelompokkan per tanggal.
- Navigasi rentang pekan fleksibel (*Previous Week, Next Week, Minggu Ini*).
- Ikon visual, durasi menit/jam, dan catatan detail tiap aktivitas.

### 5. 🧬 Time Fingerprint (Fitur Unggulan)
- **Sidik Jari Waktu Digital:** Visualisasi gelombang (*fingerprint waveform*) di mana kepadatan dan variasi garis mencerminkan proporsi alokasi waktu pengguna.
- **Radar Waktu (8-Axis Radar Chart):** Bentuk geometris unik yang memetakan persebaran waktu pengguna ke dalam diagram polar.
- **Insight Engine Cerdas:** Mesin penilai profil kepribadian produktivitas (misal: *Pelajar Sejati, Workaholic Produktif, Atlet Sejati, Polysection Life*) dihitung secara deterministik dari data riil.

### 6. 📈 Analitik Lanjutan
- Tiga mode visualisasi interaktif:
  - **Area Chart Mingguan:** Tren fluktuasi waktu hari demi hari.
  - **Bar Chart Kategori:** Perbandingan akumulasi durasi tiap kategori.
  - **Radar Chart Polar:** Distribusi keseimbangan waktu menyeluruh.

### 7. 🎮 Gamifikasi: Tantangan & Pencapaian
- **Tantangan (Challenges):** Target produktivitas mingguan (seperti *Fokus Belajar, Rutinitas Bugar, Hari Seimbang*) yang menghitung kemajuan secara langsung dari data aktivitas di database.
- **Pencapaian (Achievements / Badges):** 8 lencana penghargaan (seperti *Pemula Produktif, Kutu Buku, Pekerja Keras, Master Keseimbangan*) yang terbuka otomatis saat kriteria aktivitas terpenuhi.

### 8. 🧭 Decision Explorer & Pengaturan
- **Decision Explorer:** Simulator alokasi waktu mingguan interaktif dengan slider persentase dan proyeksi jam untuk merencanakan target hidup ideal.
- **Pengaturan & Profil:** Edit nama lengkap, toggle tema Gelap/Terang (*Dark/Light Mode*), dan ekspor riwayat aktivitas ke file JSON.
- **Sistem Notifikasi:** Popover notifikasi real-time di header aplikasi.

---

## 🛠️ Tech Stack

- **Frontend Framework:** React 18 (Vite)
- **Routing:** React Router v6
- **Styling:** Tailwind CSS + PostCSS
- **Visualisasi Data:** Recharts (RadarChart, BarChart, PieChart, AreaChart)
- **Ikonografi:** Lucide React
- **Backend & Database:** Supabase (PostgreSQL with RLS & GoTrue Auth)
- **Language / Standard:** JavaScript (ES Modules), HTML5, CSS3

---

## 🚀 Panduan Instalasi & Menjalankan Aplikasi

### Prasyarat
- [Node.js](https://nodejs.org/) (versi 18 ke atas disarankan)
- Akun [Supabase](https://supabase.com/)

### Langkah Instalasi

1. **Clone repositori:**
   ```bash
   git clone https://github.com/username/metrace.git
   cd metrace
   ```

2. **Install dependensi:**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variable:**
   Salin `.env.example` menjadi `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Isi konfigurasi Supabase proyekmu di `.env.local`:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-publishable-or-anon-key
   ```

4. **Jalankan Development Server:**
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:5173`.

5. **Build untuk Produksi:**
   ```bash
   npm run build
   ```

---

## 🗄️ Skema Database (Supabase PostgreSQL)

Aplikasi menggunakan dua tabel utama di skema `public`:

```sql
-- Tabel Profiles
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabel Activities
create table public.activities (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  category text not null check (category in ('belajar', 'kerja', 'olahraga', 'hiburan', 'istirahat', 'sosial', 'pribadi', 'lainnya')),
  duration_minutes integer not null check (duration_minutes > 0),
  activity_date date not null default current_date,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

---

## 📄 Lisensi
Proyek ini dikembangkan untuk keperluan akademik dan manajemen waktu pribadi.
Hak Cipta © 2026 METRACE Team.
