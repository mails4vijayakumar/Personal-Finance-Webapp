cd Backend
dotnet restore
dotnet run# Business Requirements Document (BRD)
## Personal Finance Application

**Document Version:** 1.0  
**Date:** March 8, 2026  
**Status:** Approved for Development

---

## 1. Executive Summary

A simple, user-friendly personal finance web application that allows users to track their income and expenses. The application provides a clear dashboard showing financial summary and maintains a transaction history for easy reference.

**Project Scope:** MVP (Minimum Viable Product) - Simple transaction tracking

---

## 2. Business Objectives

- Provide users with a simple way to track income and expenses
- Display financial summaries (total balance, total income, total expenses)
- Create a clean, intuitive interface for transaction management
- Ensure data persistence through a SQL backend

---

## 3. Functional Requirements

### 3.1 Dashboard
- **FR-1.1:** Display total balance (income - expenses)
- **FR-1.2:** Display total income amount
- **FR-1.3:** Display total expenses amount
- **FR-1.4:** Update summary in real-time when transactions are added/removed

### 3.2 Add Transaction
- **FR-2.1:** User can input transaction amount (decimal)
- **FR-2.2:** User can input transaction description (text)
- **FR-2.3:** User can select transaction type (Income/Expense)
- **FR-2.4:** System automatically captures current date and time
- **FR-2.5:** Validate amount is positive and description is not empty
- **FR-2.6:** Submit form to backend API
- **FR-2.7:** Clear form after successful submission
- **FR-2.8:** Show success/error notification

### 3.3 Transaction List
- **FR-3.1:** Display all transactions in a table format
- **FR-3.2:** Show columns: Date, Description, Amount, Type
- **FR-3.3:** Display transactions in reverse chronological order (newest first)
- **FR-3.4:** Support transaction deletion (optional enhancement)
- **FR-3.5:** Update list automatically when new transaction is added

---

## 4. Non-Functional Requirements

### 4.1 Performance
- **NFR-1.1:** Page load time < 2 seconds
- **NFR-1.2:** Transaction submission response < 1 second

### 4.2 Usability
- **NFR-2.1:** Dark theme UI
- **NFR-2.2:** Responsive design (works on desktop and mobile)
- **NFR-2.3:** Intuitive and simple interface - no complex navigation

### 4.3 Reliability
- **NFR-3.1:** 99% API uptime
- **NFR-3.2:** Data persistence across sessions

### 4.4 Security
- **NFR-4.1:** HTTPS for data transmission
- **NFR-4.2:** Input validation on both frontend and backend

---

## 5. Data Requirements

### 5.1 Database Schema

**Table: transactions**
| Column | Type | Constraint | Description |
|--------|------|-----------|-------------|
| id | INTEGER | PRIMARY KEY AUTO INCREMENT | Unique transaction identifier |
| description | VARCHAR(255) | NOT NULL | Transaction description |
| amount | DECIMAL(10,2) | NOT NULL, CHECK (amount > 0) | Transaction amount |
| type | ENUM('income', 'expense') | NOT NULL | Transaction type |
| date | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Transaction date |
| created_at | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |

---

## 6. Technical Architecture

### 6.1 Frontend
- **Framework:** React with Vite
- **Styling:** CSS with dark theme
- **State Management:** React Hooks (useState, useEffect)
- **HTTP Client:** Fetch API

### 6.2 Backend
- **Runtime:** .NET 8
- **Framework:** ASP.NET Core
- **Database:** SQL (SQLite for development, PostgreSQL for production)
- **ORM:** Entity Framework Core

### 6.3 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions` | Retrieve all transactions |
| POST | `/api/transactions` | Create new transaction |
| DELETE | `/api/transactions/:id` | Delete transaction (optional) |

---

## 7. User Stories

### 7.1 US-1: View Financial Summary
**As a** user  
**I want to** see my total balance, total income, and total expenses  
**So that** I can understand my current financial situation at a glance

**Acceptance Criteria:**
- Dashboard displays three summary cards: Balance, Income, Expenses
- Numbers update immediately when transactions are added
- Summary is accurate (Balance = Income - Expenses)

### 7.2 US-2: Add Income Transaction
**As a** user  
**I want to** add income transactions with amount and description  
**So that** I can track all my income sources

**Acceptance Criteria:**
- Form accepts amount (decimal) and description
- Default type is set to "Income"
- Transaction is saved with current date/time
- Form clears after successful submission
- Transaction appears in list immediately

### 7.3 US-3: Add Expense Transaction
**As a** user  
**I want to** add expense transactions with amount and description  
**So that** I can track all my spending

**Acceptance Criteria:**
- Form accepts amount (decimal) and description
- Type can be selected as "Expense"
- Transaction is saved with current date/time
- Form clears after successful submission
- Transaction appears in list immediately

### 7.4 US-4: View All Transactions
**As a** user  
**I want to** see a list of all my transactions  
**So that** I can review my financial history

**Acceptance Criteria:**
- Transactions display in a table format
- Newest transactions appear first
- Shows Date, Description, Amount, Type for each transaction
- Table updates automatically when new transactions are added

---

## 8. Out of Scope (Future Enhancements)

- User authentication and multi-user support
- Transaction categories
- Budget tracking
- Recurring transactions
- Transaction search/filtering
- Reports and charts
- Data export (CSV/PDF)
- Mobile app (native)

---

## 9. Success Criteria

- ✅ All transactions persist in SQL database
- ✅ Dashboard summary calculates correctly
- ✅ Users can add transactions within 5 seconds
- ✅ Dark theme UI is applied across entire application
- ✅ Application is responsive and works on mobile browsers
- ✅ No validation errors on form submission
- ✅ Zero data loss

---

## 10. Assumptions & Constraints

### Assumptions
- Single user application (no authentication)
- All amounts are positive numbers
- No timezone handling required (local time)
- No file storage or backup requirements

### Constraints
- MVP release within 1 sprint
- Minimal UI/UX design required
- SQLite for local development, PostgreSQL for production
- CORS enabled for frontend-backend communication

---

## 11. Timeline & Deliverables

| Phase | Deliverables | Timeline |
|-------|--------------|----------|
| Setup | Project structure, Database schema, API boilerplate | Day 1 |
| Backend | REST APIs, Database queries, Validation | Day 1-2 |
| Frontend | React components, Styling, API integration | Day 2 |
| Testing & Deploy | Manual testing, Bug fixes, Deployment ready | Day 3 |

---

## 12. Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Project Owner | - | 03/08/2026 | ✓ |
| Developer | - | 03/08/2026 | ✓ |

---

**End of Document**
