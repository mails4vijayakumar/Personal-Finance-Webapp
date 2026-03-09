# Personal Finance Tracker

A simple, elegant personal finance web application for tracking income and expenses. Built with ASP.NET Core backend and React frontend, featuring a dark theme UI.

## 📋 Project Structure

```
Personal-finance/
├── Backend/
│   ├── Models/
│   │   └── Transaction.cs
│   ├── Data/
│   │   └── ApplicationDbContext.cs
│   ├── Controllers/
│   │   └── TransactionsController.cs
│   ├── PersonalFinanceAPI.csproj
│   ├── Program.cs
│   ├── appsettings.json
│   └── appsettings.Development.json
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── TransactionForm.jsx
│   │   │   ├── TransactionList.jsx
│   │   │   └── FileUpload.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── .gitignore
├── BRD.md
├── README.md
├── EXCEL_IMPORT_GUIDE.md
└── .gitignore
```

## ✨ Features

- ✅ **Dashboard Summary** - View total balance, income, and expenses at a glance
- ✅ **Add Transactions** - Simple form to add income or expense transactions
- ✅ **Import from Excel** - Bulk upload transactions from .xlsx or .xls files
- ✅ **Transaction List** - View all transactions in chronological order
- ✅ **Delete Transactions** - Remove transactions
- ✅ **Dark Theme** - Beautiful dark mode UI for easy on the eyes
- ✅ **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- ✅ **Real-time Updates** - Dashboard updates automatically when transactions change

## 🛠️ Tech Stack

- **Backend:** ASP.NET Core 8 + Entity Framework Core
- **Frontend:** React 18 + Vite
- **Database:** SQLite (development) / PostgreSQL (production ready)
- **Styling:** CSS3 with Dark Theme
- **API:** RESTful API with CORS enabled

## 📦 Prerequisites

Before you begin, ensure you have:

- **.NET 8 SDK** - [Download](https://dotnet.microsoft.com/download/dotnet/8.0)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **npm or yarn** - Comes with Node.js

## 🚀 Getting Started

### Step 1: Clone/Setup the Repository

```bash
cd d:\POC\Personal-finance
```

### Step 2: Setup Backend (ASP.NET Core)

#### Navigate to Backend folder:
```bash
cd Backend
```

#### Restore NuGet packages:
```bash
dotnet restore
```

#### Create/Initialize the database:
```bash
dotnet ef database update
```
*(Note: If migrations don't exist, the database will be created automatically on first run)*

#### Run the backend server:
```bash
dotnet run
```

The API should now be running on `http://localhost:5000`

**Check the API:**
- Open browser: `http://localhost:5000/swagger`
- You should see the Swagger UI with available endpoints

### Step 3: Setup Frontend (React)

#### Open a new terminal and navigate to Frontend folder:
```bash
cd Frontend
```

#### Install dependencies:
```bash
npm install
```

#### Start the development server:
```bash
npm run dev
```

The React app should now be running on `http://localhost:5173`

**Open in browser:**
```
http://localhost:5173
```

## 📡 API Endpoints

All endpoints are prefixed with `/api/`

### Get All Transactions
```
GET /transactions
```
Returns array of all transactions sorted by date (newest first)

**Response:**
```json
[
  {
    "id": 1,
    "description": "Salary",
    "amount": 5000.00,
    "type": "income",
    "date": "2026-03-08T10:30:00Z",
    "createdAt": "2026-03-08T10:30:00Z"
  },
  {
    "id": 2,
    "description": "Groceries",
    "amount": 50.00,
    "type": "expense",
    "date": "2026-03-08T14:15:00Z",
    "createdAt": "2026-03-08T14:15:00Z"
  }
]
```

### Get Summary
```
GET /transactions/summary
```
Returns financial summary with balance, income, and expenses

**Response:**
```json
{
  "balance": 4950.00,
  "totalIncome": 5000.00,
  "totalExpenses": 50.00
}
```

### Create Transaction
```
POST /transactions
Content-Type: application/json

{
  "description": "Freelance Project",
  "amount": 150.50,
  "type": "income"
}
```

**Response (201 Created):**
```json
{
  "id": 3,
  "description": "Freelance Project",
  "amount": 150.50,
  "type": "income",
  "date": "2026-03-08T15:45:00Z",
  "createdAt": "2026-03-08T15:45:00Z"
}
```

### Delete Transaction
```
DELETE /transactions/{id}
```

**Response (204 No Content)**

### Upload Transactions from Excel
```
POST /transactions/upload
Content-Type: multipart/form-data

Form Data:
- file: [Excel file (.xlsx or .xls)]
```

**Request Example:**
- Use the web UI file upload component or `curl`:
```bash
curl -X POST -F "file=@transactions.xlsx" http://localhost:5000/api/transactions/upload
```

**Response (200 OK):**
```json
{
  "message": "Successfully imported 5 transactions",
  "count": 5,
  "transactions": [
    {
      "id": 4,
      "description": "Monthly Salary",
      "amount": 5000.00,
      "type": "income",
      "date": "2026-03-01T00:00:00Z",
      "createdAt": "2026-03-08T16:00:00Z"
    },
    ...
  ]
}
```

**Excel Format (Bank Statement Format):**
- Column A: Date (optional, uses current date if empty)
- Column B: Narration (Description) - Required
- Column C: Chq./Ref.No (Optional - appended to narration)
- Column D: Withdrawal Amt. (For expenses)
- Column E: Deposit Amt. (For income)

**Example:**
| Date | Narration | Chq./Ref.No | Withdrawal Amt. | Deposit Amt. |
|---|---|---|---|---|
| 2026-03-01 | Monthly Salary | - | | 5000 |
| 2026-03-02 | Groceries | CHQ123 | 150.50 | |

For detailed Excel format guide, see [EXCEL_IMPORT_GUIDE.md](EXCEL_IMPORT_GUIDE.md)

## 🎨 Dark Theme Features

The application features a comprehensive dark theme:

- **Primary Background:** #0f0f0f (Deep black)
- **Secondary Background:** #1a1a1a (Dark gray)
- **Text Color:** #e0e0e0 (Light gray)
- **Accent Colors:** 
  - Income: #10b981 (Green)
  - Expense: #ef4444 (Red)
  - Balance: #8b5cf6 (Purple)

All components are styled with dark theme colors and smooth transitions.

## 📱 Responsive Breakpoints

- **Desktop:** Full layout with 2-column grid
- **Tablet (768px):** Adjusted spacing and grid
- **Mobile (480px):** Single column layout, optimized touch targets

## 🔧 Configuration

### Backend Configuration
Edit `Backend/appsettings.json` to configure:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=PersonalFinance.db"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information"
    }
  }
}
```

### Frontend Configuration
Edit `Frontend/vite.config.js` to change:

```javascript
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:5000',  // Backend URL
      changeOrigin: true
    }
  }
}
```

## 📝 Database Schema

**Transactions Table:**

| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | Primary Key, Auto-increment |
| description | VARCHAR(255) | Transaction description |
| amount | DECIMAL(10,2) | Transaction amount (positive) |
| type | VARCHAR(20) | "income" or "expense" |
| date | DATETIME | Transaction date |
| created_at | DATETIME | Record creation timestamp |

## 🧪 Testing the Application

### Test Adding Transactions:
1. Open `http://localhost:5173`
2. Fill in the form:
   - Description: "Test Income"
   - Amount: "100"
   - Type: "Income"
3. Click "Add Transaction"
4. Verify it appears in the transaction list
5. Verify the dashboard summary updates

### Test Delete Transaction:
1. Hover over any transaction
2. Click the delete icon (🗑️)
3. Confirm deletion
4. Transaction should be removed and summary updated

## 🐛 Troubleshooting

### Backend won't start
```
Error: Port 5000 already in use
```
- Change port in `launchSettings.json` or kill process using port 5000

### Database connection error
```
Error: Unable to open database file
```
- Delete `PersonalFinance.db` and run: `dotnet ef database update`

### Frontend can't reach API
```
Error: Failed to fetch data
```
- Ensure backend is running on `http://localhost:5000`
- Check CORS is enabled in `Program.cs`
- Verify proxy settings in `vite.config.js`

### Node modules issues
```
npm install fails
```
- Delete `node_modules` and `package-lock.json`
- Run: `npm install`

## 📚 Project Development

### Build Backend
```bash
cd Backend
dotnet build
```

### Build Frontend
```bash
cd Frontend
npm run build
```

Output: `Frontend/dist/`

### Run Production Build
```bash
cd Frontend
npm run preview
```

## 🚀 Deployment

### Backend (ASP.NET Core)
```bash
dotnet publish -c Release -o ./publish
# Deploy publish folder to Azure App Service or server
```

### Frontend (React)
```bash
npm run build
# Deploy dist/ folder to Azure Static Web Apps, Netlify, or Vercel
```

## 📄 License

This project is for personal use. Feel free to modify and extend as needed.

## 🎯 Future Enhancements

Planned features for future versions:
- Transaction categories
- Budget tracking
- Monthly reports and charts
- User authentication
- Data export (CSV/PDF)
- Transaction search and filters
- Recurring transactions
- Mobile app (React Native)

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the BRD.md for requirements
3. Check API responses in browser DevTools

---

**Happy tracking! 💰**
