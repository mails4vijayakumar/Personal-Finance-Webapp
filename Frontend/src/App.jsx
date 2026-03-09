import { useState, useEffect } from 'react'
import { useAuth } from './context/useAuth'
import { useCategories } from './hooks/useCategories'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import CategoriesPage from './components/CategoriesPage'
import BudgetsPage from './components/BudgetsPage'
import TransactionForm from './components/TransactionForm'
import TransactionList from './components/TransactionList'
import TransactionFilters from './components/TransactionFilters'
import FileUpload from './components/FileUpload'
import './App.css'

const API_URL = '/api'

function App() {
    const { isAuthenticated, token, logout, loading: authLoading } = useAuth()
    const { categories, loading: categoriesLoading } = useCategories()
    const [authView, setAuthView] = useState('login') // 'login' or 'register'
    const [currentPage, setCurrentPage] = useState('dashboard') // 'dashboard', 'categories', or 'budgets'
    const [transactions, setTransactions] = useState([])
    const [filteredTransactions, setFilteredTransactions] = useState([])
    const [summary, setSummary] = useState({ balance: 0, totalIncome: 0, totalExpenses: 0 })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [activeFilters, setActiveFilters] = useState({
        categoryId: null,
        type: null,
        startDate: null,
        endDate: null
    })

    // Fetch transactions and summary
    const fetchData = async (filters = {}) => {
        if (!isAuthenticated || !token) return

        try {
            setLoading(true)
            setError(null)

            // Build query string with filters
            const queryParams = new URLSearchParams()
            if (filters.search) queryParams.append('search', filters.search)
            if (filters.categoryId) queryParams.append('categoryId', filters.categoryId)
            if (filters.type) queryParams.append('type', filters.type)
            if (filters.startDate) queryParams.append('startDate', filters.startDate)
            if (filters.endDate) queryParams.append('endDate', filters.endDate)

            const queryString = queryParams.toString()
            const transURL = queryString ? `${API_URL}/transactions?${queryString}` : `${API_URL}/transactions`

            const [transRes, summaryRes] = await Promise.all([
                fetch(transURL, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }),
                fetch(`${API_URL}/transactions/summary`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
            ])

            if (!transRes.ok || !summaryRes.ok) {
                throw new Error('Failed to fetch data')
            }

            const transData = await transRes.json()
            const summaryData = await summaryRes.json()

            setTransactions(transData)
            setFilteredTransactions(transData)
            setSummary(summaryData)
        } catch (err) {
            setError('Failed to load data: ' + err.message)
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    // Load data when authenticated
    useEffect(() => {
        if (isAuthenticated && token) {
            fetchData()
        }
    }, [isAuthenticated, token])

    // Handle search
    const handleSearch = async (searchTerm) => {
        setSearchTerm(searchTerm)
        const filters = {
            search: searchTerm,
            ...activeFilters
        }
        await fetchData(filters)
    }

    // Handle filter
    const handleFilter = async (filterOptions) => {
        setActiveFilters(filterOptions)
        const filters = {
            search: searchTerm,
            ...filterOptions
        }
        await fetchData(filters)
    }

    // Handle reset filters
    const handleResetFilters = async () => {
        setSearchTerm('')
        setActiveFilters({
            categoryId: null,
            type: null,
            startDate: null,
            endDate: null
        })
        await fetchData()
    }

    // Add transaction
    const handleAddTransaction = async (transaction) => {
        if (!token) return

        try {
            setError(null)
            setSuccess(null)

            const response = await fetch(`${API_URL}/transactions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(transaction)
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to add transaction')
            }

            setSuccess('Transaction added successfully!')
            setTimeout(() => setSuccess(null), 3000)

            // Refresh data
            await fetchData()
        } catch (err) {
            setError(err.message)
        }
    }

    // Delete transaction
    const handleDeleteTransaction = async (id) => {
        if (!token) return

        try {
            setError(null)
            const response = await fetch(`${API_URL}/transactions/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (!response.ok) {
                throw new Error('Failed to delete transaction')
            }

            setSuccess('Transaction deleted successfully!')
            setTimeout(() => setSuccess(null), 3000)

            // Refresh data
            await fetchData()
        } catch (err) {
            setError(err.message)
        }
    }

    // Show loading while checking authentication
    if (authLoading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading...</p>
            </div>
        )
    }

    // Show auth screens if not authenticated
    if (!isAuthenticated) {
        return authView === 'login' ? (
            <Login onSwitchToRegister={() => setAuthView('register')} />
        ) : (
            <Register onSwitchToLogin={() => setAuthView('login')} />
        )
    }

    // Show main app if authenticated
    return (
        <div className="app-container">
            <header className="app-header">
                <h1>💰 Personal Finance Tracker</h1>
                <button className="btn-logout" onClick={logout}>Logout</button>
            </header>

            <nav className="app-nav">
                <button
                    className={`nav-button ${currentPage === 'dashboard' ? 'active' : ''}`}
                    onClick={() => setCurrentPage('dashboard')}
                >
                    📊 Dashboard
                </button>
                <button
                    className={`nav-button ${currentPage === 'categories' ? 'active' : ''}`}
                    onClick={() => setCurrentPage('categories')}
                >
                    📂 Categories
                </button>
                <button
                    className={`nav-button ${currentPage === 'budgets' ? 'active' : ''}`}
                    onClick={() => setCurrentPage('budgets')}
                >
                    💰 Budgets
                </button>
            </nav>

            <main className="app-main">
                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                {currentPage === 'dashboard' ? (
                    <>
                        <Dashboard summary={summary} loading={loading} />

                        <section className="section section-full-width">
                            <h2>📊 Import Transactions from Excel</h2>
                            <FileUpload onUploadSuccess={fetchData} token={token} />
                        </section>

                        <div className="content-grid">
                            <section className="section">
                                <h2>Add Transaction</h2>
                                <TransactionForm onAddTransaction={handleAddTransaction} token={token} />
                            </section>

                            <section className="section">
                                <h2>Recent Transactions</h2>
                                <TransactionFilters 
                                    categories={categories}
                                    onSearch={handleSearch}
                                    onFilter={handleFilter}
                                    onReset={handleResetFilters}
                                />
                                {loading ? (
                                    <p className="loading">Loading transactions...</p>
                                ) : filteredTransactions.length === 0 ? (
                                    <p className="empty-state">No transactions found.</p>
                                ) : (
                                    <TransactionList 
                                        transactions={filteredTransactions} 
                                        categories={categories}
                                        onDelete={handleDeleteTransaction} 
                                    />
                                )}
                            </section>
                        </div>
                    </>
                ) : currentPage === 'categories' ? (
                    <CategoriesPage />
                ) : (
                    <BudgetsPage />
                )}
            </main>

            <footer className="app-footer">
                <p>&copy; 2026 Personal Finance Tracker. Keep track of your money.</p>
            </footer>
        </div>
    )
}

export default App
