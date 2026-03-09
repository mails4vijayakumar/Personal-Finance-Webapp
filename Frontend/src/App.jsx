import { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import TransactionForm from './components/TransactionForm'
import TransactionList from './components/TransactionList'
import FileUpload from './components/FileUpload'
import './App.css'

const API_URL = '/api'

function App() {
    const [transactions, setTransactions] = useState([])
    const [summary, setSummary] = useState({ balance: 0, totalIncome: 0, totalExpenses: 0 })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)

    // Fetch transactions and summary
    const fetchData = async () => {
        try {
            setLoading(true)
            setError(null)

            const [transRes, summaryRes] = await Promise.all([
                fetch(`${API_URL}/transactions`),
                fetch(`${API_URL}/transactions/summary`)
            ])

            if (!transRes.ok || !summaryRes.ok) {
                throw new Error('Failed to fetch data')
            }

            const transData = await transRes.json()
            const summaryData = await summaryRes.json()

            setTransactions(transData)
            setSummary(summaryData)
        } catch (err) {
            setError('Failed to load data: ' + err.message)
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    // Initial load
    useEffect(() => {
        fetchData()
    }, [])

    // Add transaction
    const handleAddTransaction = async (transaction) => {
        try {
            setError(null)
            setSuccess(null)

            const response = await fetch(`${API_URL}/transactions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
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
        try {
            setError(null)
            const response = await fetch(`${API_URL}/transactions/${id}`, {
                method: 'DELETE'
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

    return (
        <div className="app-container">
            <header className="app-header">
                <h1>💰 Personal Finance Tracker</h1>
            </header>

            <main className="app-main">
                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <Dashboard summary={summary} loading={loading} />

                <section className="section section-full-width">
                    <h2>📊 Import Transactions from Excel</h2>
                    <FileUpload onUploadSuccess={fetchData} />
                </section>

                <div className="content-grid">
                    <section className="section">
                        <h2>Add Transaction</h2>
                        <TransactionForm onAddTransaction={handleAddTransaction} />
                    </section>

                    <section className="section">
                        <h2>Recent Transactions</h2>
                        {loading ? (
                            <p className="loading">Loading transactions...</p>
                        ) : transactions.length === 0 ? (
                            <p className="empty-state">No transactions yet. Add one to get started!</p>
                        ) : (
                            <TransactionList transactions={transactions} onDelete={handleDeleteTransaction} />
                        )}
                    </section>
                </div>
            </main>

            <footer className="app-footer">
                <p>&copy; 2026 Personal Finance Tracker. Keep track of your money.</p>
            </footer>
        </div>
    )
}

export default App
