# **muktiAp – Next-Gen Ethiopian ERP**

A modern, AI-powered **Enterprise Resource Planning (ERP)** system designed specifically for Ethiopian businesses.

---

## 🚀 Features

* **Multi-Language Support**
  English, Amharic, and Afan Oromo

* **AI Assistant**
  Powered by **Google Gemini** for intelligent business insights and automation

* **Finance Management**
  Track transactions, manage accounts, and generate financial reports

* **Inventory Management**
  Real-time stock tracking with low-stock alerts

* **HR Module**
  Employee management and task assignment

* **Sales Module**
  Order processing and customer management

* **Chapa Integration**
  Secure Ethiopian payment gateway support

* **Ethiopian Calendar Support**
  Built-in Ethiopian date system

---

## 📋 Prerequisites

Make sure you have the following installed:

* **Node.js** v18+
* **npm**
* **MongoDB Atlas** (or local MongoDB)
* **Google Gemini API Key**
* **Chapa API Key** (for payments)

---

## 🛠️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone <your-repo-url>
cd muktiap---next-gen-ethiopian-erp
```

### 2️⃣ Install Frontend Dependencies

```bash
npm install
```

### 3️⃣ Install Backend Dependencies

```bash
cd server
npm install
```

---

## ⚙️ Environment Configuration

### Frontend Environment (`.env.local` in root)

```env
GEMINI_API_KEY=your_gemini_api_key_here
VITE_API_URL=http://localhost:5001/api
```

### Backend Environment (`server/.env`)

```env
PORT=5001
NODE_ENV=development
DATABASE_URL="your_mongodb_connection_string"
JWT_SECRET=your_secure_jwt_secret_here
GOOGLE_AI_API_KEY=your_gemini_api_key_here
CHAPA_SECRET_KEY=your_chapa_secret_key
FRONTEND_URL=http://localhost:3000
```

---

## 🗄️ Database Setup

```bash
cd server
npx prisma generate
npx prisma db push
```

---

## ▶️ Running the Application

### Terminal 1 – Backend

```bash
cd server
npm start
```

### Terminal 2 – Frontend

```bash
npm run dev
```

### 🌐 Application URLs

* **Frontend:** [http://localhost:3000](http://localhost:3000)
* **Backend API:** [http://localhost:5001](http://localhost:5001)
* **Health Check:** [http://localhost:5001/health](http://localhost:5001/health)

---

## 🎯 Usage Guide

### First-Time Setup

1. Open [http://localhost:3000](http://localhost:3000)
2. Click **Get Started** or **Sign Up**
3. Register your company and user account
4. Choose a plan (Starter / Professional / Enterprise)
5. Log in and access the dashboard

> Test data can be created directly from the dashboard modules.

---

## 📁 Project Structure

```
muktiap/
├── components/           # React components
│   ├── auth/             # Authentication pages
│   ├── dashboard/        # Dashboard modules
│   └── ui/               # Reusable UI components
├── services/             # API services
├── utils/                # Utility functions
├── server/               # Backend application
│   ├── src/
│   │   ├── controllers/  # API controllers
│   │   ├── middleware/   # Authentication & validation
│   │   ├── routes/       # API routes
│   │   └── utils/        # Helper functions
│   └── prisma/           # Prisma schema
├── types.ts              # TypeScript types
└── App.tsx               # Root application component
```

---

## 🔧 Available Scripts

### Frontend

* `npm run dev` – Start development server
* `npm run build` – Build for production
* `npm run preview` – Preview production build

### Backend

* `npm start` – Start production server
* `npm run dev` – Start server with nodemon
* `npm run db:push` – Push schema updates
* `npm run db:studio` – Open Prisma Studio

---

## 🌐 API Endpoints

### Authentication

* `POST /api/auth/register`
* `POST /api/auth/login`

### Dashboard

* `GET /api/dashboard/stats`

### Employees

* `GET /api/employees`
* `POST /api/employees`

### Finance

* `GET /api/finance/transactions`
* `POST /api/finance/transactions`
* `GET /api/finance/accounts`
* `POST /api/finance/accounts`

### Inventory

* `GET /api/inventory/items`
* `POST /api/inventory/items`

### Tasks

* `GET /api/tasks`
* `POST /api/tasks`
* `PATCH /api/tasks/:id/status`

### Sales

* `GET /api/sales/orders`
* `POST /api/sales/orders`

### AI Assistant

* `POST /api/ai/chat`

---

## 🔐 Security Features

* JWT-based authentication
* Password hashing with **bcrypt**
* API rate limiting
* CORS configuration
* Request validation using **express-validator**

---

## 🌍 Internationalization (i18n)

Supported Languages:

* English (EN)
* Amharic (AM)
* Afan Oromo (OR)

Language switching is available from the navbar or dashboard header.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch

   ```bash
   git checkout -b feature/YourFeatureName
   ```
3. Commit changes

   ```bash
   git commit -m "Add YourFeatureName"
   ```
4. Push to GitHub

   ```bash
   git push origin feature/YourFeatureName
   ```
5. Open a Pull Request

---

## 📝 License

This project is **proprietary software**.
All rights reserved.

---

## 📧 Support

For support:

* Email: **[support@muktiap.com](mailto:muktarabdulkader35@gmail.com)**
* Or open an issue in the repository

---

## 🙏 Acknowledgments

* **Google Gemini AI**
* **Chapa Payment Gateway**
* **Prisma ORM**
* **React & Vite**
