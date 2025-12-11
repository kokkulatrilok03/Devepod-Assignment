# Construction Mini ERP & Finance System

A full-stack Enterprise Resource Planning (ERP) system tailored for the construction industry, built with React, Node.js, Express, and SQLite.

## Live Deployment
- Frontend: https://devepod-assignment.vercel.app/
- Backend API: https://devepod-assignment.onrender.com/api

## Features

### Core Features
- **User Management**: Register/Login with JWT authentication
- **Role-Based Access Control**: Admin, Finance Manager, Project Manager roles
- **Protected Routes**: Both backend and frontend route protection

### Finance Module
- **General Ledger**: Chart of Accounts CRUD operations
- **Journal Entries**: Create and approve journal entries with double-entry accounting
- **Accounts Receivable/Payable**: Invoice creation and management
- **Payment Tracking**: Track payments for invoices
- **Multi-Currency Support**: Exchange rates table with auto-conversion
- **Financial Reports**:
  - Balance Sheet
  - Profit & Loss Statement
  - Cash Flow Statement

### AI Insights Module (Logic-Based Predictions)
- **Risk Score Calculation**: Based on budget vs actual, progress mismatch, invoice delays
- **Cash Flow Forecast**: Simple moving average prediction
- **Project Health Assessment**: On Track, At Risk, or Delayed status

### Dashboard
- Total Revenue & Expenses
- Outstanding Invoices
- Cash Flow Trends
- Current Risk Alerts
- Active Projects Count

## Tech Stack

### Frontend
- React 18
- Vite
- React Router
- Axios
- Chart.js / React-Chartjs-2
- Tailwind CSS

### Backend
- Node.js
- Express.js
- SQLite3
- JWT (jsonwebtoken)
- bcryptjs

## Project Structure

```
Devepod/
├── server/                 # Backend
│   ├── config/            # Database configuration
│   ├── controllers/       # Business logic
│   ├── routes/           # API routes
│   ├── middleware/       # Auth & role checking
│   └── index.js         # Server entry point
├── client/               # Frontend
│   ├── src/
│   │   ├── pages/       # Page components
│   │   ├── components/  # Reusable components
│   │   ├── services/    # API service
│   │   ├── context/     # Auth context
│   │   └── utils/       # Helper functions
│   └── package.json
├── database/            # Database files
│   ├── schema.sql      # Database schema
│   └── seed.sql        # Seed data
└── docs/               # Documentation
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the server directory:
```env
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development
```

4. Start the server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

The server will run on `http://localhost:5000`

The database will be automatically created at `database/construction_erp.db` on first run.

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

### Default Login Credentials

After running the seed data, you can login with:

- **Admin**: 
  - Username: `admin`
  - Password: `admin123`

- **Finance Manager**: 
  - Username: `finance`
  - Password: `admin123`

- **Project Manager**: 
  - Username: `pm1`
  - Password: `admin123`

**Note**: The seed data includes placeholder password hashes. For production, you should:
1. Register new users through the registration endpoint, OR
2. Update the password hashes in the database with proper bcrypt hashes

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile

### Finance
- `GET /api/finance/accounts` - Get all accounts
- `POST /api/finance/accounts` - Create account
- `GET /api/finance/invoices` - Get invoices
- `POST /api/finance/invoices` - Create invoice
- `GET /api/finance/payments` - Get payments
- `POST /api/finance/payments` - Create payment
- `GET /api/finance/journal-entries` - Get journal entries
- `POST /api/finance/journal-entries` - Create journal entry
- `GET /api/finance/reports/balance-sheet` - Balance sheet
- `GET /api/finance/reports/profit-loss` - Profit & Loss
- `GET /api/finance/reports/cash-flow` - Cash Flow Statement

### Insights
- `GET /api/insights/risk/:project_id` - Get risk score for project
- `GET /api/insights/risk` - Get all risk scores
- `GET /api/insights/cash-flow-forecast` - Cash flow forecast
- `GET /api/insights/project-health/:project_id` - Project health
- `GET /api/insights/project-health` - All projects health

### Dashboard
- `GET /api/dashboard` - Get dashboard summary data

### Admin
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/audit-logs` - Get audit logs

For detailed API documentation, see [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)

## Database Schema

The database includes the following main tables:
- `users` - User accounts
- `roles` - User roles
- `projects` - Construction projects
- `accounts` - Chart of accounts
- `journal_entries` - Journal entries
- `transactions` - Transaction lines
- `invoices` - Invoices (receivable/payable)
- `payments` - Payment records
- `customers` - Customer information
- `vendors` - Vendor information
- `exchange_rates` - Currency exchange rates
- `risk_logs` - Risk assessment logs
- `audit_logs` - System audit logs

See `database/schema.sql` for the complete schema.

## Development

### Running in Development Mode

Backend (with nodemon for auto-reload):
```bash
cd server
npm run dev
```

Frontend (with Vite hot-reload):
```bash
cd client
npm run dev
```

### Building for Production

Frontend:
```bash
cd client
npm run build
```

The built files will be in `client/dist/`

## Testing

You can test the API endpoints using:
- Postman
- Insomnia
- curl
- The frontend application

See `docs/API_DOCUMENTATION.md` for example requests.

## Security Notes

- Change the `JWT_SECRET` in production
- Use strong passwords in production
- Implement rate limiting for production
- Use HTTPS in production
- Regularly update dependencies

## License

This project is created for educational purposes as part of the NXTWAVE assignment.

## Support

For issues or questions, please refer to the documentation in the `docs/` folder.

