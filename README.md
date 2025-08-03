# 📝 BlogHub – Full-Stack Blogging Application

BlogHub is a **feature-rich blogging platform** that allows users to create, edit, delete, and interact with blog posts in a seamless environment.
Built with **Node.js, Express, MongoDB, and a responsive frontend**, BlogHub provides a smooth, modern, and intuitive blogging experience.

---

## 📑 Table of Contents

* [🚀 Features](#-features)
* [🛠️ Tech Stack](#️-tech-stack)
* [📂 Project Structure](#-project-structure)
* [⚙️ Installation & Setup](#️-installation--setup)
* [🤝 Contribution Guidelines](#-contribution-guidelines)
* [📜 License](#-license)
* [👨‍💻 Author](#-author)

---

## 🚀 Features

* ✍️ **Create, Edit & Delete Blogs** – Manage your posts with ease.
* 👤 **User Authentication & Authorization** – Secure login and role-based access.
* 🗂 **Categories & Drafts** – Organize and save blogs before publishing.
* ❤️ **Likes & Comments** – Engage readers with interactive features.
* 🔔 **Notifications** – Stay updated with real-time alerts.
* 📂 **Image Uploads** – Cloud-based media storage via Cloudinary.
* 🛡 **Admin Dashboard** – Manage users, blogs, and reports efficiently.
* 🌐 **Responsive UI** – Optimized for desktop and mobile devices.

---

## 🛠️ Tech Stack

### **Backend (API)**

* Node.js
* Express.js
* MongoDB (Mongoose ODM)
* Cloudinary (Image Hosting)
* Multer (File Uploads)
* JWT (Authentication)

### **Frontend (Client)**

* HTML, CSS, JavaScript (Vanilla/Framework based on your implementation)
* Fetch API for REST communication

---

## 📂 Project Structure

```
TheBlogHub/
│
├── api/              # Backend (server-side code)
│   ├── config/       # Configurations (Cloudinary, Multer)
│   ├── controllers/  # Business logic for each feature
│   ├── middleware/   # Authentication & file handling
│   ├── models/       # Mongoose data models
│   ├── routes/       # API endpoints
│   ├── uploads/      # Uploaded files
│   └── utils/        # Helper functions (email, errors)
│
├── client/           # Frontend files
│   ├── index.html    # Main HTML page
│   ├── components/   # Reusable UI components
│   ├── styles/       # CSS files
│   └── js/           # Client-side logic
│
└── README.md
```

---

## ⚙️ Installation & Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/harshwadhwani-10/bloghub---Blogging-Application.git
   cd bloghub---Blogging-Application
   ```

2. **Backend setup**

   ```bash
   cd api
   npm install
   ```

   * Create a `.env` file based on `.env.example` and add:

     ```
     MONGO_URI=your_mongo_database_url
     JWT_SECRET=your_jwt_secret
     CLOUDINARY_API_KEY=your_key
     CLOUDINARY_API_SECRET=your_secret
     ```
   * Start the server:

     ```bash
     npm start
     ```

3. **Frontend setup**

   ```bash
   cd ../client
   # Open index.html in browser or run with Live Server
   ```

---

## 🤝 Contribution Guidelines

We welcome contributions from the community!

1. Fork the repository
2. Create a feature branch (`feature/your-feature`)
3. Commit your changes
4. Submit a Pull Request

---

## 📜 License

This project is licensed under the **MIT License**.
Feel free to use, modify, and distribute it as per the license terms.

---

## 👨‍💻 Author

* **Harsh Wadhwani** – [GitHub Profile](https://github.com/harshwadhwani-10)

---
