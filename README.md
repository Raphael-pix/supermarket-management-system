# 🏪 Supermarket Admin Dashboard

A production-ready, full-stack admin dashboard for managing a distributed supermarket chain across Kenya. Built with modern technologies and best practices for scalability, security, and user experience.

## 🎯 Project Overview

This system manages a supermarket chain with 5 branches across Kenya:

- **Nairobi** (Headquarters)
- **Kisumu**
- **Mombasa**
- **Nakuru**
- **Eldoret**

### Products Managed

- **Coke** - KES 80
- **Fanta** - KES 75
- **Sprite** - KES 75

_Uniform pricing across all branches_

## ✨ Features

### 📊 Dashboard

- Real-time business metrics (total revenue, sales count)
- Revenue breakdown by product (bar chart)
- Sales distribution by branch (pie chart)
- Sales trend analysis (line chart - 30 days)
- Recent transactions table
- Low stock alerts

### 📦 Inventory Management

- View stock levels per branch and product
- Low stock threshold alerts
- Restock functionality (HQ → branches)
- Real-time inventory updates
- Stock status indicators

### 📈 Sales Reports

- Consolidated reports across all branches
- Revenue by product breakdown
- Sales by branch analysis
- Top-performing products
- Date range filtering
- Export functionality (ready to implement)

### 👥 User Management (RBAC)

- View all registered users
- Promote customers to admin
- Role-based access control
- Admin promotion safeguards
- User statistics and analytics

## 🛠️ Tech Stack

### Frontend

- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS (modern dashboard aesthetic)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Auth**: Clerk React SDK
- **HTTP**: Axios
- **Routing**: React Router v6

### Backend

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **ORM**: Prisma ORM
- **Database**: Neon PostgreSQL
- **Auth**: Clerk Node SDK
- **CORS**: cors middleware

### DevOps & Tools

- **Build Tool**: Vite
- **Database Hosting**: Neon (serverless Postgres)
- **Authentication**: Clerk (SaaS)
- **Version Control**: Git

## 🔐 Authentication & RBAC

### Role System

```
┌─────────────────────────────────────┐
│      Public Sign Up Page            │
│  (Creates CUSTOMER role by default) │
└──────────────┬──────────────────────┘
               │
               ▼
    ┌──────────────────────┐
    │   After Login:       │
    │                      │
    │  customer → Customer │
    │             Interface│
    │                      │
    │  admin → Admin       │
    │          Dashboard   │
    └──────────────────────┘
```

### Key Security Rules

✅ Public sign-up creates `customer` role only
✅ Admin accounts CANNOT be created via sign-up
✅ Only existing admins can promote users
✅ Cannot demote the last admin
✅ Role enforcement at API and UI level

## 📁 Project Structure

```
supermarket-admin/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   └── seed.js             # Initial data
│   ├── src/
│   │   ├── middleware/         # Auth & RBAC
│   │   ├── controllers/        # Business logic
│   │   ├── routes/             # API endpoints
│   │   └── server.js           # Express app
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/              # Page components
│   │   ├── utils/              # Utilities
│   │   ├── App.jsx             # Main app
│   │   └── index.css           # Tailwind styles
│   ├── index.html
│   └── package.json
│
├── PROJECT_STRUCTURE.md
├── SETUP_GUIDE.md
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database (Neon recommended)
- Clerk account

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
```

2. **Install dependencies**

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. **Configure environment variables**

Create `.env` files based on `.env.example` in both directories.

4. **Initialize database**

```bash
cd backend
npx prisma generate
npx prisma db push
npm run prisma:seed
```

5. **Create first admin**

Sign up via Clerk, then update the role in database:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE "clerkId" = 'your_clerk_id';
```

6. **Start the application**

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

7. **Access the dashboard**
   Open http://localhost:5173

## 📊 Database Schema

### Core Models

- **User**: Linked to Clerk, stores role
- **Branch**: 5 locations (HQ + 4 branches)
- **Product**: 3 drinks with uniform pricing
- **Inventory**: Stock per branch/product
- **Sale**: Transaction records
- **SaleItem**: Line items in sales
- **RestockLog**: Audit trail for restocking

## 🎨 Design Philosophy

### Visual Design

- **Clean & Modern**: Neutral slate/gray palette
- **Professional**: Business intelligence aesthetic
- **Consistent**: White cards with soft shadows
- **Responsive**: Desktop-first, mobile-ready
- **Accessible**: Clear typography hierarchy

### Code Quality

- **Type Safety**: Prisma schema validation
- **Error Handling**: Comprehensive try-catch blocks
- **Modular**: Separated concerns (MVC pattern)
- **Reusable**: Component-based architecture
- **Documented**: Clear comments and docs

## 🔄 Key Workflows

### 1. Restock Branch

```
Admin → Inventory → Restock Button → Select Branch →
Enter Quantities → Confirm → HQ Stock ↓ Branch Stock ↑
```

### 2. Promote User to Admin

```
Admin → Users → Find Customer → Promote Button →
Confirm → User Role = ADMIN → Access Granted
```

### 3. View Sales Analytics

```
Admin → Sales Reports → Apply Filters →
View Charts & Tables → Export (optional)
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] Sign up as new user (should be customer)
- [ ] Login as admin (should see dashboard)
- [ ] View dashboard metrics and charts
- [ ] Check inventory levels
- [ ] Perform restock operation
- [ ] View low stock alerts
- [ ] Generate sales reports
- [ ] Promote user to admin
- [ ] Verify role-based access

## 🚀 Production Deployment

### Backend (Render/Railway/Fly.io)

1. Set environment variables
2. Run `npx prisma generate`
3. Run `npx prisma db push`
4. Start with `npm start`

### Frontend (Vercel/Netlify)

1. Set `VITE_CLERK_PUBLISHABLE_KEY`
2. Set `VITE_API_URL` to backend URL
3. Build command: `npm run build`
4. Publish directory: `dist`

### Database (Neon)

- Already cloud-hosted
- Enable automatic backups
- Monitor usage and scaling

## 📝 API Endpoints

### Dashboard

- `GET /api/dashboard/metrics` - Overall metrics
- `GET /api/dashboard/sales-timeline` - Daily sales
- `GET /api/dashboard/recent-transactions` - Recent sales

### Inventory

- `GET /api/inventory` - All inventory
- `GET /api/inventory/branches` - All branches
- `GET /api/inventory/products` - All products
- `POST /api/inventory/restock` - Restock branch
- `GET /api/inventory/low-stock` - Low stock items

### Sales

- `GET /api/sales/reports` - Sales reports
- `GET /api/sales/detailed` - Detailed transactions
- `GET /api/sales/analytics` - Advanced analytics

### Users

- `GET /api/users` - All users
- `GET /api/users/stats` - User statistics
- `POST /api/users/:id/promote` - Promote to admin
- `POST /api/users/:id/demote` - Demote to customer
- `POST /api/users/sync-clerk` - Sync user from Clerk

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## 👨‍💻 Author

Built with ❤️ for distributed systems management

## 🙏 Acknowledgments

- **Clerk** - Authentication & user management
- **Neon** - Serverless PostgreSQL
- **Prisma** - Type-safe database access
- **Recharts** - Beautiful React charts
- **Tailwind CSS** - Utility-first styling

## 📞 Support

For issues or questions:

- Check SETUP_GUIDE.md for detailed setup instructions
- Review PROJECT_STRUCTURE.md for architecture details
- Open an issue on GitHub

---

**⚠️ Important**: This is an admin-only interface. Customer purchasing functionality is intentionally not included in this build.
