import { useState, useEffect } from 'react'
import { useCategories } from '../context/useCategories'
import '../styles/Budgets.css'

export default function BudgetForm({ onSubmit, onCancel, initialBudget = null }) {
    const { categories, fetchCategories } = useCategories()
    const [categoryId, setCategoryId] = useState('')
    const [amount, setAmount] = useState('')
    const [month, setMonth] = useState(new Date().getMonth() + 1)
    const [year, setYear] = useState(new Date().getFullYear())
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchCategories()
    }, [])

    useEffect(() => {
        if (initialBudget) {
            setCategoryId(initialBudget.categoryId)
            setAmount(initialBudget.amount)
            setMonth(initialBudget.month)
            setYear(initialBudget.year)
        }
    }, [initialBudget])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)

        if (!categoryId) {
            setError('Please select a category')
            return
        }

        if (!amount || parseFloat(amount) <= 0) {
            setError('Budget amount must be greater than 0')
            return
        }

        setLoading(true)
        const result = await onSubmit(
            parseInt(categoryId),
            parseFloat(amount),
            parseInt(month),
            parseInt(year)
        )
        setLoading(false)

        if (result.success) {
            setCategoryId('')
            setAmount('')
            setMonth(new Date().getMonth() + 1)
            setYear(new Date().getFullYear())
        } else {
            setError(result.error)
        }
    }

    return (
        <div className="budget-form-container">
            <h3>{initialBudget ? 'Edit Budget' : 'Set Budget'}</h3>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit} className="budget-form">
                <div className="form-group">
                    <label htmlFor="categoryId">Category</label>
                    <select
                        id="categoryId"
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        disabled={loading || initialBudget}
                        className="category-select"
                    >
                        <option value="">-- Select Category --</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="month">Month</label>
                        <select
                            id="month"
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            disabled={loading || initialBudget}
                            className="month-select"
                        >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                <option key={m} value={m}>
                                    {new Date(2024, m - 1).toLocaleString('default', { month: 'long' })}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="year">Year</label>
                        <select
                            id="year"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            disabled={loading || initialBudget}
                            className="year-select"
                        >
                            {Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - 1 + i).map(y => (
                                <option key={y} value={y}>
                                    {y}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="amount">Budget Amount</label>
                    <input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        disabled={loading}
                        step="0.01"
                        min="0"
                    />
                </div>

                <div className="form-actions">
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : initialBudget ? 'Update' : 'Create Budget'}
                    </button>
                    {onCancel && (
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onCancel}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    )
}
