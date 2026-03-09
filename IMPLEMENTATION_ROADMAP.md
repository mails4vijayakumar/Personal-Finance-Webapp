# Implementation Roadmap

## Phase 1: User Authentication (Backend)

### Models to Create:
1. **User.cs** - User account model
2. **UpdateTransactionController** - Add UserId foreign key

### API Endpoints:
- `POST /api/auth/register` - New user registration
- `POST /api/auth/login` - User login, return JWT token
- `GET /api/auth/profile` - Get current user profile
- `POST /api/auth/logout` - Logout (frontend will clear token)

### Security:
- Password hashing (Argon2 recommended)
- JWT token generation with 7-day expiry
- Authorization middleware to validate tokens

---

## Phase 2: User-Defined Categories

### Models:
1. **Category.cs** - User categories

### API Endpoints:
- `GET /api/categories` - Get user's categories
- `POST /api/categories` - Create category
- `DELETE /api/categories/{id}` - Delete category
- `GET /api/categories/{id}` - Get category details

### Database:
- Link categories to users (UserId FK)

---

## Phase 3: Budget Tracking

### Models:
1. **Budget.cs** - Monthly budget per category

### API Endpoints:
- `GET /api/budgets` - Get user's budgets
- `POST /api/budgets` - Create budget
- `PUT /api/budgets/{id}` - Update budget
- `DELETE /api/budgets/{id}` - Delete budget
- `GET /api/budgets/status` - Get budget vs actual spending

---

## Phase 4: Advanced Search & Filtering

### Update Endpoints:
- `GET /api/transactions?search=text&category=id&startDate=date&endDate=date&type=income/expense`

---

## Phase 5: Reports & Charts

### API Endpoints:
- `GET /api/reports/monthly-summary` - Monthly income/expense
- `GET /api/reports/category-breakdown` - Spending by category
- `GET /api/reports/daily-trend` - Daily spending trend

### Frontend:
- Install Chart.js: `npm install chart.js react-chartjs-2`
- Create chart components

---

## Frontend Structure

### New Components:
1. **Auth/** - Login, Register, PrivateRoute
2. **Categories/** - CategoryList, CategoryForm
3. **Budgets/** - BudgetDashboard, BudgetForm
4. **Reports/** - Charts, Analytics dashboard
5. **Search/** - AdvancedSearch component

### State Management:
- Add `user` and `token` to global state
- Store token in localStorage

---

## Database Migrations

### New Tables:
```sql
CREATE TABLE Users (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Username NVARCHAR(100) UNIQUE NOT NULL,
    Email NVARCHAR(100) UNIQUE NOT NULL,
    PasswordHash NVARCHAR(MAX) NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Categories (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId INT NOT NULL,
    Name NVARCHAR(100) NOT NULL,
    ColorHex NVARCHAR(7),
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserId) REFERENCES Users(Id)
);

CREATE TABLE Budgets (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId INT NOT NULL,
    CategoryId INT NOT NULL,
    Amount DECIMAL(10,2) NOT NULL,
    Month INT NOT NULL,
    Year INT NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserId) REFERENCES Users(Id),
    FOREIGN KEY (CategoryId) REFERENCES Categories(Id)
);
```

### Modified Table:
```sql
ALTER TABLE Transactions ADD UserId INT;
ALTER TABLE Transactions ADD COLUMN CategoryId INT;
ALTER TABLE Transactions ADD FOREIGN KEY (UserId) REFERENCES Users(Id);
ALTER TABLE Transactions ADD FOREIGN KEY (CategoryId) REFERENCES Categories(Id);
```

---

## Implementation Order:

1. ✅ Add User model & database
2. ✅ Create Auth Controller (register/login)
3. ✅ Add JWT middleware
4. ✅ Update Transactions table with UserId
5. ✅ Create Category model & controller
6. ✅ Add CategoryId to Transactions
7. ✅ Update TransactionController to respect user isolation
8. ✅ Create Budget model & controller
9. ✅ Update frontend with Auth screens
10. ✅ Add PrivateRoute protection
11. ✅ Create category management UI
12. ✅ Create budget UI
13. ✅ Add search/filtering
14. ✅ Add Chart.js & create reports
15. ✅ Create chart components

Ready to start? 🚀
