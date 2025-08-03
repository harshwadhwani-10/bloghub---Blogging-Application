# Blog Hub: Core Concepts, Objects, and Context

**[View this file in project: `doc/object-context-information.md`](../doc/object-context-information.md)**

---

## Objects & Concepts

### 1. User
- **Context:** Authentication, profile, roles (admin/user), session state.
- **Information:**
  - Registration, login, password reset, profile update.
  - Redux state for user info.
  - Avatar image upload (Cloudinary).

### 2. Blog Post
- **Context:** Main content entity; authored by users, can include images, code, and comments.
- **Information:**
  - Title, content (rich text via CKEditor), featured image, category, author, timestamps.
  - CRUD operations (create, read, update, delete).
  - Images are uploaded to Cloudinary and rendered responsively.

### 3. Category
- **Context:** Organizes blog posts; managed by admin.
- **Information:**
  - Add/edit/delete categories.
  - Category assignment for each blog post.

### 4. Comment
- **Context:** User-generated feedback on blog posts.
- **Information:**
  - Add, view, and count comments per blog.
  - Comment moderation and display.

### 5. Like
- **Context:** User engagement metric for blog posts.
- **Information:**
  - Like/unlike functionality.
  - Like count display.

### 6. Draft
- **Context:** In-progress blog posts saved by users.
- **Information:**
  - Save, update, and delete drafts.
  - Drafts are private to the author.

### 7. Notification
- **Context:** System/user notifications for actions (e.g., new comment, like).
- **Information:**
  - Notification dropdown, unread/read state.

### 8. Code Editor (Programming Blogs)
- **Context:** Custom code playground for C++/C/Java in programming category blogs.
- **Information:**
  - Syntax highlighting (Prism.js), multiple themes (Solarized Dark, etc.).
  - Code execution via Judge0 API.
  - Handles operator color and scroll issues for C++.

### 9. Admin Dashboard
- **Context:** Admin-only management of users, blogs, categories, and site settings.
- **Information:**
  - User management, blog moderation, category CRUD.

### 10. API & Backend
- **Context:** Express.js REST API for all data operations.
- **Information:**
  - Controllers for blog, user, comment, category, draft, notification, auth.
  - MongoDB models for all core objects.
  - Cloudinary for all image uploads (no local storage).

---

## Contextual Information

- **Authentication:** JWT-based, with protected routes and role checks.
- **State Management:** Redux for user/session state.
- **Styling:** Tailwind CSS, custom CSS modules, and utility classes.
- **Image Handling:** All images (profile, blog, content) are uploaded to Cloudinary and rendered responsively.
- **Rich Text:** CKEditor for blog content, supporting images and formatting.
- **Routing:** React Router for frontend navigation; Express Router for backend API.
- **Responsiveness:** All UI components and images are responsive for mobile, tablet, and desktop.
- **Security:** Input validation, file type/size checks, and error handling throughout.

---

**This file is auto-generated for project documentation.**
