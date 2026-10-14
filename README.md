# TikTok Downloader (Videos & Photo Carousels)

A lightweight and modern web application to download TikTok videos (without watermark) and photo slide carousels, built with **Node.js**, **Express**, **MVC architecture**, and **Object-Oriented Programming (OOP)**.

---

## Features

- **No-Watermark Videos**: Download TikTok videos in SD or HD quality.
- **Photo Carousel / Slide Support**:
  - Interactive photo slider with preview navigation.
  - Download individual photos (`.jpeg`).
  - Download selected photos or all photos bundled in a `.zip` archive.
- **Audio Extraction**: Download background music as `.mp3`.
- **Direct Stream Downloads**: Media is piped directly from the source CDN to the client without saving files to the server's disk (low RAM and zero disk usage).
- **HTML Minification**: Minifies HTML output on the fly to remove comments and whitespace for faster page load times.
- **Rate Limiting**: Built-in sliding-window rate limiter to protect the server from spam and abuse.

---

## Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/) (v18+ recommended)
- **Backend**: Express.js, EJS (Template Engine)
- **Frontend**: Vanilla JavaScript (OOP), Tailwind CSS
- **Utilities**: Axios, Archiver (ZIP streaming), HTML Minifier Terser

---

## Project Structure

```text
tiktok-downloader-mvc-oop/
├── public/
│   ├── css/style.css               # Additional styling
│   └── js/main.js                  # Frontend client (OOP event controller)
├── src/
│   ├── config/Config.js            # Configuration singleton class
│   ├── controllers/TikTokController.js  # Request handling & responses
│   ├── errors/AppError.js          # Custom error hierarchy
│   ├── middlewares/
│   │   ├── ErrorMiddleware.js      # Global error handler
│   │   ├── HtmlMinifierMiddleware.js# HTML output minifier
│   │   └── RateLimiter.js          # In-memory rate limiter
│   ├── models/TikTokVideo.js       # Media domain model entity
│   ├── routes/TikTokRouter.js      # Application route definitions
│   ├── services/
│   │   ├── BaseExtractor.js        # Abstract extractor class
│   │   ├── TikWmExtractor.js       # Concrete TikTok data extractor
│   │   └── StreamService.js        # Media streaming & ZIP piping
│   ├── views/index.ejs             # Frontend UI template
│   ├── app.js                      # Express application setup
│   └── server.js                   # Application entry point
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## Getting Started

### 1. Prerequisites

Ensure you have **Node.js** (v18.0.0 or higher) and **npm** installed on your machine.

Verify your installation:
```bash
node -v
npm -v
```

### 2. Installation

1. Clone or download this repository.
2. Open your terminal in the project directory and install dependencies:
   ```bash
   npm install
   ```

### 3. Environment Variables (Optional)

Copy the `.env.example` file to `.env`:
```bash
# On Windows PowerShell:
Copy-Item .env.example .env

# On Linux / macOS / Git Bash:
cp .env.example .env
```
*Note: The application has built-in defaults, so this step is optional for local development.*

### 4. Running the Application

- **Development Mode** (with automatic restart on file changes):
  ```bash
  npm run dev
  ```

- **Production Mode**:
  ```bash
  npm start
  ```

Once started, open your web browser and navigate to:
```text
http://localhost:3000
```

---

## How to Use

1. Copy any public TikTok link (either a **Video** or a **Photo Slide Carousel**).
2. Paste the URL into the input field and click **Download**.
3. Choose your download option:
   - For **Videos**: Click to download No Watermark (SD), HD, or MP3 audio.
   - For **Photos**: Use the carousel slider to preview photos, select specific photos using the checkboxes, and download them individually or as a `.zip` archive.

---

## License

This project is open-source and available under the [MIT License](LICENSE).
