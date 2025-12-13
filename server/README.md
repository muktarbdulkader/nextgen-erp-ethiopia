# muktiAp Backend API

Express.js backend for muktiAp ERP system with MongoDB and Prisma ORM.

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`

3. Setup database:
```bash
npx prisma generate
npx prisma db push
```

4. Start server:
```bash
npm start
```

## Environment Variables

See `.env` file for all required configuration.

## API Documentation

API runs on http://localhost:5001

Health check: http://localhost:5001/health

All protected routes require `Authorization: Bearer <token>` header.
