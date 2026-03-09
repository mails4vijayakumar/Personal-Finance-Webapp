# 🚀 Quick Start Guide

## One-Command Setup (Windows)

### Terminal 1: Backend
```bash
cd d:\POC\Personal-finance\Backend
dotnet restore
dotnet run
```
✅ Backend runs on: `http://localhost:5000`

### Terminal 2: Frontend
```bash
cd d:\POC\Personal-finance\Frontend
npm install
npm run dev
```
✅ Frontend runs on: `http://localhost:5173`

### Open in Browser
```
http://localhost:5173
```

---

## ⏱️ Expected Setup Time
- Backend: ~30 seconds after `dotnet run`
- Frontend: ~1-2 minutes first time (npm install), ~5 seconds after

---

## 🎯 Test It Out

1. **Add Income:**
   - Description: "Salary"
   - Amount: "5000"
   - Type: Income
   - Click "Add Transaction"

2. **Add Expense:**
   - Description: "Groceries"
   - Amount: "150"
   - Type: Expense
   - Click "Add Transaction"

3. **Check Dashboard:**
   - Total Balance should show: $4850
   - Total Income: $5000
   - Total Expenses: $150

---

## 🔗 Useful Links

- **Frontend App:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **API Swagger Docs:** http://localhost:5000/swagger

---

## 🛑 Stop Servers

- Backend: Press `Ctrl + C` in Terminal 1
- Frontend: Press `Ctrl + C` in Terminal 2

---

## ❌ Having Issues?

See **Troubleshooting** section in [README.md](README.md)

---

**Happy tracking! 💰**
