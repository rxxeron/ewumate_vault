# EWUmate Vault (`vault.ewumate.pro.bd`)

> **East West University Public Study Materials, Past Questions & Notes Archive**  
> An open educational initiative by the EWUmate Ecosystem.

---

## 🌟 Features Overview

### 1. 100% Public Access
- Anyone (students, prospective students, visitors) can search, browse, preview, and download study materials without needing to log in.
- Supports PDF preview directly in the browser and 1-click Google Drive downloads.

### 2. Multi-Faceted Organization & Filtering
- **By Course Code**: e.g., `CSE106`, `MAT101`, `PHY109`, `ENG101`, `ACT101`, etc.
- **By Semester**: `Summer 2026`, `Spring 2026`, `Fall 2025`, etc.
- **By Faculty Initial**: e.g., `JUDDIN`, `TD`, `MFA`, etc.
- **By Material Type**: Mid Exam Questions, Final Exam Questions, Quiz Questions, Lecture Slides, Class Notes, Lab Manuals / Code, Course Outlines, and Books.
- Dynamic counts displayed across all categories, courses, and faculties.

### 3. Strict EWU Student Authentication for Uploads
- Downloads are open to all, but **uploading requires an official East West University student email**: `xxxx-x-xx-xxx@std.ewubd.edu`.
- Automatic user registration if the valid EWU student account doesn't exist yet.
- Real-time client-side domain verification blocks unauthorized non-EWU emails.

### 4. Contributor Leaderboard & Hall of Fame
- Recognizes active student contributors who upload study materials.
- Displays contributor upload counts, student IDs, and badges (*Pioneer*, *Master Contributor*, *Scholar*, *Rising Star*).

### 5. EWUmate Ecosystem Growth Integration
- Always-present top banner reminding students to use the **EWUmate Companion App** (Live schedule tracker, gap notification alerts before class, CGPA goal calculator, advising assistant).
- Interactive modal showcasing key EWUmate features with direct links to the web app (`ewumate.pro.bd`) and services portal (`services.ewumate.pro.bd`).

---

## 🛠 Tech Stack
- **Framework**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS, Lucide Icons, Glassmorphic UI
- **Database & Auth**: Supabase (`study_materials`, `profiles`, `semesters`, `course_metadata`)
- **Hosting**: GitHub Pages (`vault.ewumate.pro.bd` via `CNAME`)

---

## 🚀 Getting Started Locally

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Build for production
npm run build
```

---

## 🌐 Custom Domain & Deployment
- Custom domain `vault.ewumate.pro.bd` is configured via `CNAME`.
- Set up a GitHub Actions workflow or push the `dist/` directory to your `gh-pages` branch.
