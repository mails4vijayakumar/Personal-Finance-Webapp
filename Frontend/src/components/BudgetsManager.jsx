import { useState, useEffect } from 'react'
import { useBudgets } from '../context/useBudgets'
import BudgetForm from './BudgetForm'
import BudgetStatus from './BudgetStatus'
import '../styles/Budgets.css'

export default function BudgetsManager() {
    const {
        budgets,
        budgetStatus,
        loading,
        error,
        fetchBudgets,
        fetchBudgetStatus,
        createBudget,
        updateBudget,
        deleteBudget
    } = useBudgets()

    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [deleteConfirm, setDeleteConfirm] = useState(null)
    const [operationError, setOperationError] = useState(null)
    const [deleteError, setDeleteError] = useState(null)
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

    useEffect(() => {
        refreshData()
    }, [selectedMonth, selectedYear])

    const refreshData = async () => {
        await fetchBudgets(selectedMonth, selectedYear)
        await fetchBudgetStatus(selectedMonth, selectedYear)
    }

    const handleCreateBudget = async (categoryId, amount, month, year) => {
        setOperationError(null)
        const result = await createBudget(categoryId, amount, month, year)
        if (result.success) {
            setShowForm(false)
            await refreshData()
        } else {
            setOperationError(result.error)
        }
        return result
    }

    const handleUpdateBudget = async (amount) => {
        setOperationError(null)
        const result = await updateBudget(editingId, amount)
        if (result.success) {
            setEditingId(null)
            await refreshData()
        } else {
            setOperationError(result.error)
        }
        return result
    }

    const handleDeleteBudget = async (id) => {
        setDeleteError(null)
        const result = await deleteBudget(id)
        if (result.success) {
            setDeleteConfirm(null)
            await refreshData()
        } else {
            setDeleteError(result.error)
        }
    }

    const editingBudget = budgets.find(b => b.id === editingId)

    return (
        <div className="budgets-manager">
            <div className="budgets-header">
                <h2>💰 Budget Management</h2>
                {!showForm && !editingId && (
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setShowForm(true)}
                    >
                        + Add Budget
                    </button>
                )}
            </div>

            {error && <div className="alert alert-error">Failed to load budgets: {error}</div>}
            {operationError && <div className="alert alert-error">{operationError}</div>}
            {deleteError && <div className="alert alert-error">{deleteError}</div>}

            <div className="month-year-selector">
                <div className="selector-group">
                    <label htmlFor="monthSelect">Month:</label>
                    <select
                        id="monthSelect"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                            <option key={m} value={m}>
                                {new Date(2024, m - 1).toLocaleString('default', { month: 'long' })}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="selector-group">
                    <label htmlFor="yearSelect">Year:</label>
                    <select
                        id="yearSelect"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    >
                        {Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - 1 + i).map(y => (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {showForm && (
                <BudgetForm
                    onSubmit={handleCreateBudget}
                    onCancel={() => setShowForm(false)}
                />
            )}

            {editingId && (
                <BudgetForm
                    initialBudget={editingBudget}
                    onSubmit={async (catId, amount, month, year) => {
                        await handleUpdateBudget(amount)
                        return { success: !operationError }
                    }}
                    onCancel={() => setEditingId(null)}
                />
            )}

            <BudgetStatus statusData={budgetStatus} />

            {!showForm && !editingId && budgets.length > 0 && (
                <div className="budgets-list">
                    <h3>Budgets for {new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                    <div className="budgets-table">
                        {budgets.map(budget => (
                            <div key={budget.id} className="budget-row">
                                <div className="budget-info">
                                    <h4>{budget.category?.name || 'Unknown'}</h4>
                                    <p className="budget-amount">${budget.amount.toFixed(2)}</p>
                                </div>
                                <div className="budget-row-actions">
                                    <button
                                        className="btn-icon btn-edit"
                                        onClick={() => setEditingId(budget.id)}
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        className="btn-icon btn-delete"
                                        onClick={() => setDeleteConfirm(budget.id)}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {deleteConfirm && (
                <div className="delete-confirmation-overlay" onClick={() => setDeleteConfirm(null)}>
                    <div className="delete-confirmation-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Delete Budget?</h3>
                        <p>Are you sure you want to delete this budget?</p>
                        <div className="confirmation-actions">
                            <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDeleteBudget(deleteConfirm)}
                            >
                                Delete
                            </button>
                            <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => setDeleteConfirm(null)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
