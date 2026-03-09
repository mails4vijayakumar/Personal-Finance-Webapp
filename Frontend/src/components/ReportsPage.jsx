import { useState, useEffect } from 'react'
import { useAuth } from '../context/useAuth'
import { useCategories } from '../hooks/useCategories'
import { useBudgets } from '../hooks/useBudgets'
import { Pie, Bar, Line } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js'
import '../styles/Reports.css'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
)

const API_URL = '/api'

export default function ReportsPage() {
    const { token } = useAuth()
    const { categories } = useCategories()
    const { budgets } = useBudgets()
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Fetch transactions for report data
    useEffect(() => {
        if (!token) return

        const fetchTransactions = async () => {
            try {
                setLoading(true)
                setError(null)

                const response = await fetch(`${API_URL}/transactions`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })

                if (!response.ok) {
                    throw new Error('Failed to fetch transactions')
                }

                const data = await response.json()
                setTransactions(data)
            } catch (err) {
                setError('Failed to load data: ' + err.message)
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchTransactions()
    }, [token])

    // Calculate spending by category
    const getSpendingByCategory = () => {
        const spending = {}

        transactions.forEach(transaction => {
            if (transaction.type === 'expense') {
                const categoryId = transaction.categoryId
                const categoryName = categories.find(c => c.id === categoryId)?.name || 'Uncategorized'
                spending[categoryName] = (spending[categoryName] || 0) + transaction.amount
            }
        })

        return spending
    }

    // Get spending trend over time (last 12 months)
    const getSpendingTrend = () => {
        const trend = {}
        const now = new Date()

        // Initialize last 12 months
        for (let i = 11; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
            const key = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
            trend[key] = 0
        }

        // Aggregate spending by month
        transactions.forEach(transaction => {
            if (transaction.type === 'expense') {
                const transDate = new Date(transaction.date)
                const key = transDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
                if (trend.hasOwnProperty(key)) {
                    trend[key] += transaction.amount
                }
            }
        })

        return trend
    }

    // Get budget performance
    const getBudgetPerformance = () => {
        const performance = {}

        budgets.forEach(budget => {
            const categoryName = categories.find(c => c.id === budget.categoryId)?.name || 'Uncategorized'
            const spent = transactions
                .filter(t => t.type === 'expense' && t.categoryId === budget.categoryId)
                .reduce((sum, t) => sum + t.amount, 0)

            performance[categoryName] = {
                budget: budget.amount,
                spent: spent,
                remaining: budget.amount - spent
            }
        })

        return performance
    }

    // Pie chart data - Spending by Category
    const spendingData = getSpendingByCategory()
    const pieChartData = {
        labels: Object.keys(spendingData),
        datasets: [
            {
                label: 'Spending by Category',
                data: Object.values(spendingData),
                backgroundColor: [
                    '#4a9eff',
                    '#ff6b6b',
                    '#51cf66',
                    '#ffd93d',
                    '#a78bfa',
                    '#f97316',
                    '#06b6d4',
                    '#ec4899'
                ],
                borderColor: '#1a1a1a',
                borderWidth: 2,
                hoverOffset: 10
            }
        ]
    }

    // Bar chart data - Budget Performance
    const budgetPerformance = getBudgetPerformance()
    const budgetChartData = {
        labels: Object.keys(budgetPerformance),
        datasets: [
            {
                label: 'Budget',
                data: Object.values(budgetPerformance).map(b => b.budget),
                backgroundColor: '#4a9eff',
                borderColor: '#2196F3',
                borderWidth: 1
            },
            {
                label: 'Spent',
                data: Object.values(budgetPerformance).map(b => b.spent),
                backgroundColor: '#ff6b6b',
                borderColor: '#f44336',
                borderWidth: 1
            }
        ]
    }

    // Line chart data - Spending Trend
    const spendingTrend = getSpendingTrend()
    const lineChartData = {
        labels: Object.keys(spendingTrend),
        datasets: [
            {
                label: 'Monthly Spending',
                data: Object.values(spendingTrend),
                borderColor: '#4a9eff',
                backgroundColor: 'rgba(74, 158, 255, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#4a9eff',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }
        ]
    }

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                labels: {
                    color: '#e0e0e0',
                    font: {
                        size: 14,
                        weight: 'bold'
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#e0e0e0',
                bodyColor: '#e0e0e0',
                borderColor: '#4a9eff',
                borderWidth: 1,
                padding: 10,
                displayColors: true,
                callbacks: {
                    label: function (context) {
                        const value = context.parsed.y || context.parsed
                        return `$${value.toFixed(2)}`
                    }
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: '#e0e0e0'
                },
                grid: {
                    color: 'rgba(224, 224, 224, 0.1)'
                }
            },
            y: {
                ticks: {
                    color: '#e0e0e0'
                },
                grid: {
                    color: 'rgba(224, 224, 224, 0.1)'
                }
            }
        }
    }

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    color: '#e0e0e0',
                    font: {
                        size: 14,
                        weight: 'bold'
                    },
                    padding: 20
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#e0e0e0',
                bodyColor: '#e0e0e0',
                borderColor: '#4a9eff',
                borderWidth: 1,
                padding: 10,
                callbacks: {
                    label: function (context) {
                        const value = context.parsed
                        const total = context.dataset.data.reduce((a, b) => a + b, 0)
                        const percentage = ((value / total) * 100).toFixed(1)
                        return `$${value.toFixed(2)} (${percentage}%)`
                    }
                }
            }
        }
    }

    if (loading) {
        return (
            <div className="reports-container">
                <h1>📊 Financial Reports</h1>
                <p className="loading">Loading report data...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="reports-container">
                <h1>📊 Financial Reports</h1>
                <div className="alert alert-error">{error}</div>
            </div>
        )
    }

    return (
        <div className="reports-container">
            <h1>📊 Financial Reports</h1>

            <div className="reports-grid">
                {/* Pie Chart - Spending by Category */}
                <section className="report-card">
                    <h2>💰 Spending by Category</h2>
                    {Object.keys(spendingData).length > 0 ? (
                        <div className="chart-container">
                            <Pie data={pieChartData} options={pieOptions} />
                        </div>
                    ) : (
                        <p className="no-data">No spending data available</p>
                    )}
                </section>

                {/* Bar Chart - Budget Performance */}
                <section className="report-card">
                    <h2>📈 Budget Performance</h2>
                    {Object.keys(budgetPerformance).length > 0 ? (
                        <div className="chart-container">
                            <Bar data={budgetChartData} options={chartOptions} />
                        </div>
                    ) : (
                        <p className="no-data">No budget data available</p>
                    )}
                </section>

                {/* Line Chart - Spending Trend */}
                <section className="report-card report-card-full">
                    <h2>📉 Spending Trend (Last 12 Months)</h2>
                    {Object.values(spendingTrend).some(v => v > 0) ? (
                        <div className="chart-container">
                            <Line data={lineChartData} options={chartOptions} />
                        </div>
                    ) : (
                        <p className="no-data">No spending history available</p>
                    )}
                </section>

                {/* Summary Statistics */}
                <section className="report-card report-card-full">
                    <h2>📊 Summary Statistics</h2>
                    <div className="stats-grid">
                        <div className="stat-box">
                            <div className="stat-label">Total Spending</div>
                            <div className="stat-value">
                                ${transactions
                                    .filter(t => t.type === 'expense')
                                    .reduce((sum, t) => sum + t.amount, 0)
                                    .toFixed(2)}
                            </div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-label">Total Income</div>
                            <div className="stat-value">
                                ${transactions
                                    .filter(t => t.type === 'income')
                                    .reduce((sum, t) => sum + t.amount, 0)
                                    .toFixed(2)}
                            </div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-label">Total Transactions</div>
                            <div className="stat-value">{transactions.length}</div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-label">Total Budget</div>
                            <div className="stat-value">
                                ${budgets.reduce((sum, b) => sum + b.amount, 0).toFixed(2)}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
