# 🖥️ ResuMesh - Private Admin Dashboard

This is the private administrative control panel for ResuMesh owners. It is built as a dark-themed single-page application (SPA) using **React**, **Vite**, and **TypeScript** to manage portfolio assets and perform administrative operations.

## 🛠️ Tech Stack & Tooling
- **Build Tool:** Vite
- **Language:** TypeScript (`StrictMode` enforced)
- **Styling:** Tailwind CSS + Lucide React Icons
- **Linter:** Oxlint (High-performance JS/TS linter)

## 🚀 Local Development Setup

### Prerequisites
- Node.js 20+

### Installation Steps
1. Navigate to the admin frontend directory:
   ```bash
   cd admin/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your local configuration by copying `.env.example`:
   ```bash
   cp .env.example .env
   ```
   *(Ensure `VITE_ADMIN_API_URL` matches your admin backend API port e.g. `http://localhost:8001`)*

4. Start the Vite development server:
   ```bash
   npm run dev -- --port 8081
   ```

Open `http://localhost:8081` in your browser.

---

## 🧪 Testing

We use **Vitest** + **React Testing Library** for frontend testing:
- **Run all tests (headless)**:
  ```bash
  npm run test
  ```
