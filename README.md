# 🚀 LinkPilot — Modern Link-in-Bio Platform

> A sleek, high-performance link-in-bio web application built with **Next.js 16 (App Router)**, **NextAuth v5**, **MongoDB**, and **Tailwind CSS**. LinkPilot lets creators, developers, and professionals consolidate and share their online presence through a single, customizable profile.

[![Next.js](https://img.shields.io/badge/Next.js-16.3.6-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-blue?style=flat&logo=react)](https://react.dev/)
[![NextAuth.js](https://img.shields.io/badge/Auth.js-v5_Beta-purple?style=flat&logo=auth0)](https://authjs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.6-green?style=flat&logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

---

## ✨ Features

- 🔐 **Google OAuth 2.0 Authentication**  
  Secure authentication powered by **NextAuth.js (v5)** with session-based authorization and protected server-side APIs.

- ⚡ **Full CRUD Profile Management**  
  - Create and claim custom handles (`linkpilot.com/@yourhandle`).
  - Update, edit, and save bio, links, and avatar in real-time.
  - Reorder links dynamically with intuitive Move Up / Down controls.
  - Delete individual links or permanently delete your entire profile with confirmation guards.

- 🎯 **Smart Onboarding & Auto-Suggest**  
  - Auto-suggests username handle based on your email prefix on initial sign-in.
  - 1-click shortcut to use your Google profile picture.

- 🌐 **Dynamic & Public Creator Pages (`/[handle]`)**  
  - High-performance, mobile-responsive bio pages with customized links, avatar, and description.
  - Built-in social sharing and clipboard copy functionality.

- 🔍 **Real-Time Handle Search**  
  - Debounced search bar with live dropdown suggestions across creators and profiles.

- 📁 **Image Uploads & Custom Avatars**  
  - Upload profile avatars from device with file validation or use external image URLs.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Frontend** | React 19, Tailwind CSS v4 |
| **Authentication** | NextAuth.js v5 (Auth.js) with Google OAuth 2.0 |
| **Database** | MongoDB (Native Node Driver) |
| **Notifications** | React-Toastify |
| **Language** | JavaScript & TypeScript |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.18 or higher)
- [MongoDB](https://www.mongodb.com/) running locally or a [MongoDB Atlas](https://www.mongodb.com/atlas) cluster connection string.
- Google OAuth credentials from [Google Cloud Console](https://console.cloud.google.com/).

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ayush1234-svg/LinkPilot.git
   cd LinkPilot
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory (refer to `.env.example`):
   ```env
   # MongoDB Connection
   MONGODB_URI=mongodb://localhost:27017/

   # NextAuth / Auth.js
   AUTH_SECRET=your_generated_secret_key
   AUTH_GOOGLE_ID=your_google_client_id.apps.googleusercontent.com
   AUTH_GOOGLE_SECRET=your_google_client_secret

   # Host
   NEXT_PUBLIC_HOST=http://localhost:3000/
   ```

   > **Tip:** You can generate a random `AUTH_SECRET` using `openssl rand -base64 32` or PowerShell:
   > ```powershell
   > [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
   > ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to view LinkPilot.

---

## 📡 API Endpoints

| Endpoint | Method | Description | Protected |
| :--- | :--- | :--- | :--- |
| `/api/auth/[...nextauth]` | GET, POST | NextAuth authentication handler | No |
| `/api/add` | GET | Retrieve authenticated user's profile | Yes (Session) |
| `/api/add` | POST | Create or update user's profile and links | Yes (Session) |
| `/api/add` | DELETE | Delete user's profile from database | Yes (Session) |
| `/api/search?q={query}` | GET | Search profiles and handles | No |
| `/api/upload` | POST | Upload avatar image (PNG, JPG, WEBP) | No |

---

## 📄 License

This project is licensed under the MIT License.
