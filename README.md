# TikTok Downloader No Watermark (Node.js MVC + OOP)

Aplikasi web untuk mengunduh video TikTok tanpa watermark (HD/SD) beserta audio (MP3) menggunakan arsitektur **Model-View-Controller (MVC)** dan paradigma **Object-Oriented Programming (OOP)** di Node.js.

## Struktur Direktori (MVC + Service Layer)

```text
tiktok-downloader-mvc-oop/
├── public/
│   ├── css/
│   │   └── style.css          # Custom styling tambahan
│   └── js/
│       └── main.js            # Frontend OOP Client (UI & Fetch Controller)
├── src/
│   ├── config/
│   │   └── Config.js          # Singleton Class untuk manajemen konfigurasi & env
│   ├── controllers/
│   │   └── TikTokController.js # Controller Class untuk request HTTP & View rendering
│   ├── errors/
│   │   └── AppError.js        # Custom Error Class Hierarchy (Inheritance)
│   ├── middlewares/
│   │   ├── ErrorMiddleware.js # Global Error Handling Middleware Class
│   │   └── RateLimiter.js     # In-Memory Sliding Window Rate Limiter Class
│   ├── models/
│   │   └── TikTokVideo.js     # Domain Model / Entity Class (Encapsulation)
│   ├── routes/
│   │   └── TikTokRouter.js    # Routing Class untuk Web View & REST API
│   ├── services/
│   │   ├── BaseExtractor.js   # Abstract Base Class untuk Provider Extractor
│   │   ├── TikWmExtractor.js  # Concrete Extractor Class (Inheritance & Polymorphism)
│   │   └── StreamService.js   # Stream Piping Service untuk Direct Download
│   ├── views/
│   │   └── index.ejs          # Tampilan Web (View Layer) dengan Tailwind CSS
│   ├── app.js                 # Core Application Class
│   └── server.js              # Entry Point Server
├── .env.example
├── package.json
└── README.md
```

## Prinsip OOP yang Diterapkan

1. **Encapsulation**: Penggunaan private fields (`#`) pada class di Node.js modern untuk melindungi state internal (misal pada `TikTokVideo`, `Config`, `RateLimiter`).
2. **Inheritance**: `TikWmExtractor` mewarisi kontrak dari `BaseExtractor`, dan `ValidationError` / `UpstreamError` mewarisi dari `AppError`.
3. **Polymorphism**: Controller hanya berkomunikasi dengan interface `extract(url)` tanpa perlu tahu detail implementasi provider di balik layar.
4. **Single Responsibility Principle (SRP)**: Pemisahan tegas antara HTTP handling (`TikTokController`), struktur data (`TikTokVideo`), ekstraksi metadata (`TikWmExtractor`), dan streaming binary file (`StreamService`).

## Cara Menjalankan

1. Ekstrak file ZIP ini.
2. Buka terminal di dalam folder proyek, lalu instal dependensi:
   ```bash
   npm install
   ```
3. Salin file `.env.example` menjadi `.env` (opsional, sudah ada nilai default):
   ```bash
   cp .env.example .env
   ```
4. Jalankan server:
   ```bash
   npm run dev
   # atau
   npm start
   ```
5. Buka browser dan akses: `http://localhost:3000`
