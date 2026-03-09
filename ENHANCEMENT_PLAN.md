# Enhancement Plan: Major Features

## 📋 Modules to Implement

### 1. User Authentication & Multiple User Support
- User registration & login (JWT-based)
- User profiles
- Isolate data per user
- Secure password storage (bcrypt/Argon2)

### 2. Transaction Categories
- Predefined categories (Food, Transport, Utilities, etc.)
- Custom categories
- Category selection during transaction creation
- Category-based filtering

### 3. Budget Tracking
- Set monthly budgets per category
- Track spending vs. budget
- Budget exceeded alerts
- Budget dashboard widget

### 4. Reports & Charts
- Monthly spending summary chart
- Income vs. Expense pie chart
- Category-wise spending breakdown
- Date range filtering for reports

### 5. Search/Filtering
- Search transactions by description
- Filter by date range
- Filter by category
- Filter by transaction type
- Advanced search combining multiple filters

### 6. Additional Improvements
- Edit transaction capability
- Transaction notes/comments
- Recurring transactions (future)
- Data export (CSV, PDF)

---

## 🛠️ Technology Stack

### Backend enhancements
- **Authentication:** JWT tokens with .NET Identity
- **Password Security:** Argon2 (SecurePasswordHasher)
- **Authorization:** Role-based access control (RBAC)
- **Charting Data:** RESTful endpoints returning aggregated data

### Frontend enhancements
- **Charting Library:** Chart.js or Recharts
- **Authentication:** JWT stored in localStorage
- **Private Routes:** Protected components
- **UI Components:** Advanced filters, date pickers

---

## 📐 Database Schema Changes

### New Tables:
1. **Users** - User accounts
2. **Categories** - Transaction categories
3. **Budgets** - Monthly budget tracking
4. **UserCategories** - Custom user categories

### Modified Tables:
1. **Transactions** - Add `UserId` & `CategoryId` foreign keys

---

## 🎯 Implementation Phases

| Phase | Features | Timeline |
|-------|----------|----------|
| Phase 1 | User Auth, Multiple Users | Day 1-2 |
| Phase 2 | Transaction Categories | Day 2 |
| Phase 3 | Budget Tracking | Day 3 |
| Phase 4 | Search/Filtering | Day 3 |
| Phase 5 | Reports & Charts | Day 4 |

---

## ❓ Questions Before Implementation

1. **Authentication Approach:**
   - Simple JWT tokens (recommended)
   - OAuth integration with Google/GitHub?

2. **Default Categories:**
   - Should app have predefined categories user can't delete?
   - Or completely user-defined?

3. **Chart Library:**
   - Prefer Chart.js (simpler, lightweight)?
   - Or Recharts (React-native, more features)?

4. **Search Scope:**
   - Search only in user's own transactions?
   - Real-time vs. search button submit?

5. **Timeline Preference:**
   - Implement all at once?
   - Phase-by-phase approach?
   - Focus on specific features first?

