# VKU Campus Audit - Field Survey App 🏫

🚀 **Live Demo:** [https://vku-campus-audit.vercel.app/](https://vku-campus-audit.vercel.app/)

A modern, Offline-First Progressive Web Application (PWA) designed for campus facility inspections at VKU. Built with React, TypeScript, Vite, Tailwind CSS, and IndexedDB, it ensures uninterrupted data collection even in areas with zero network connectivity (basements, remote buildings).

## 🌟 Key Features

- **📱 Mobile-First & Glassmorphism UI:** Modern interface featuring pastel colors aligned with VKU branding.
- **🔌 100% Offline-First (PWA):** Work anywhere! The app uses IndexedDB to store drafts and queued submissions automatically.
- **📷 Evidence Capture:** Take photos directly using Capacitor APIs (or web fallback).
- **📍 GPS Tagging:** Tag inspection records with exact geolocation coordinates.
- **🗃️ Local Data Inspector:** View pending and synced audits directly from the local device storage.
- **🔄 Auto & Force Sync:** Automatically pushes queued records to the server when connection is restored, or allows manual force sync.
- **📤 Export to JSON/CSV:** Directly export inspection records for emergency reporting without internet access.
- **🛠️ Testing Simulator:** Built-in network toggle to test offline behaviors easily without browser DevTools.

## 🚀 Quick Start (Local Setup)

Follow these steps to set up the project on your local machine:

### 1. Prerequisites
- [Node.js](https://nodejs.org/en/) (v18 or higher recommended)
- `npm` or `yarn`

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/yXuanHang910/vku-campus-audit.git
cd vku-campus-audit
npm install
```

### 3. Development Server

Start the Vite development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. You should see the Glassmorphism UI!

### 4. Build & Preview

To build the project for production and test the PWA features (like Service Workers):

```bash
npm run build
npm run preview
```

## 🌐 Deploy to Vercel / Cloudflare Pages

This Vite project is ready for instant deployment to Cloudflare Pages or Vercel.

**Option A: Vercel**
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project root.
3. Follow the prompts (use default settings for Vite: Build Command `npm run build`, Output Directory `dist`).

**Option B: Cloudflare Pages**
1. Go to your Cloudflare Dashboard > Pages > Create a project.
2. Connect your GitHub repository.
3. Build command: `npm run build`
4. Build output directory: `dist`
5. Click **Save and Deploy**.

*(Note: Vercel/Cloudflare automatically provide HTTPS, which is required for PWA Service Workers and Geolocation APIs).*

## 📱 Mobile App (Android/iOS) via Capacitor

You can also wrap this web app into a native mobile app using Capacitor:

```bash
npm run build
npx cap sync
npx cap open android  # Opens Android Studio
# or
npx cap open ios      # Opens Xcode (Mac only)
```

## 📄 License
MIT License. Created for the VKU Campus project.
