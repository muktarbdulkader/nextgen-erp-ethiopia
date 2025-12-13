# muktiAp - Next-Gen Ethiopian ERP

A modern, AI-powered Enterprise Resource Planning system designed specifically for Ethiopian businesses.

## 🚀 Features

- **Multi-language Support**: English, Amharic, and Afan Oromo
- **AI Assistant**: Powered by Google Gemini for intelligent business insights
- **Finance Management**: Track transactions, accounts, and generate reports
- **Inventory Management**: Real-time stock tracking with low-stock alerts
- **HR Module**: Employee management and task assignment
- **Sales Module**: Order processing and customer management
- **Chapa Integration**: Ethiopian payment gateway support
- **Ethiopian Calendar**: Built-in support for Ethiopian date system

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (or local MongoDB)
- Google Gemini API key
- Chapa API key (for payments)

## 🛠️ Installation & Setup

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd muktiap---next-gen-ethiopian-erp
```

### 2. Install Frontend Dependencies
```bash
npm install
```

### 3. Install Backend Dependencies
```bash
cd server
npm install
```

### 4. Configure Environment Variables

**Frontend (.env.local in root):**
```env
GEMINI_API_KEY=your_gemini_api_key_here
VITE_API_URL=http://localhost:5001/api
```

**Backend (server/.env):**
```env
PORT=5001
NODE_ENV=development
DATABASE_URL="your_mongodb_connection_string"
JWT_SECRET=your_secure_jwt_secret_here
GOOGLE_AI_API_KEY=your_gemini_api_key_here
CHAPA_SECRET_KEY=your_chapa_secret_key
FRONTEND_URL=http://localhost:3000
```

### 5. Setup Database
```bash
cd server
npx prisma generate
npx prisma db push
```

### 6. Start the Application

**Terminal 1 - Backend:**
```bash
cd server
npm start
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001
- API Health Check: http://localhost:5001/health

## 🎯 Usage

### First Time Setup
1. Navigate to http://localhost:3000
2. Click "Get Started" or "Sign Up"
3. Create your account with company details
4. Choose a plan (Starter/Professional/Enterprise)
5. Login and start using the dashboard

### Default Test Account
After registration, you can create test data through the dashboard modules.

## 📁 Project Structure

```
muktiap/
├── components/          # React components
│   ├── auth/           # Login/Register pages
│   ├── dashboard/      # Dashboard modules
│   └── ui/             # Reusable UI components
├── services/           # API client services
├── utils/              # Utility functions
├── server/             # Backend application
│   ├── src/
│   │   ├── controllers/  # Route controllers
│   │   ├── middleware/   # Auth & validation
│   │   ├── routes/       # API routes
│   │   └── utils/        # Helper functions
│   └── prisma/          # Database schema
├── types.ts            # TypeScript definitions
└── App.tsx             # Main application component
```

## 🔧 Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend
- `npm start` - Start production server
- `npm run dev` - Start with nodemon (auto-reload)
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Prisma Studio

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Employees
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create employee

### Finance
- `GET /api/finance/transactions` - Get transactions
- `POST /api/finance/transactions` - Create transaction
- `GET /api/finance/accounts` - Get accounts
- `POST /api/finance/accounts` - Create account

### Inventory
- `GET /api/inventory/items` - Get inventory items
- `POST /api/inventory/items` - Create item

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `PATCH /api/tasks/:id/status` - Update task status

### Sales
- `GET /api/sales/orders` - Get orders
- `POST /api/sales/orders` - Create order

### AI Assistant
- `POST /api/ai/chat` - Chat with AI assistant

## 🔐 Security

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS configuration
- Input validation with express-validator

## 🌍 Internationalization

The application supports three languages:
- English (EN)
- Amharic (AM)
- Afan Oromo (OR)

Language can be switched from the navbar or dashboard header.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is proprietary software. All rights reserved.

## 📧 Support

For support, email support@muktiap.com or open an issue in the repository.

## 🙏 Acknowledgments

- Google Gemini AI for intelligent assistance
- Chapa for Ethiopian payment processing
- Prisma for database management
- React and Vite for frontend framework
