import { useState } from 'react'

function TransactionForm({ onAddTransaction, token }) {
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        type: 'expense'
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        // Validation
        if (!formData.description.trim()) {
            alert('Please enter a description')
            return
        }

        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            alert('Please enter a valid amount')
            return
        }

        onAddTransaction({
            description: formData.description.trim(),
            amount: parseFloat(formData.amount),
            type: formData.type
        })

        // Reset form
        setFormData({
            description: '',
            amount: '',
            type: 'expense'
        })
    }

    return (
        <form className="transaction-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="description">Description</label>
                <input
                    type="text"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="e.g., Groceries, Salary, Gas"
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="amount">Amount</label>
                <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="type">Type</label>
                <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                </select>
            </div>

            <button type="submit" className="btn btn-primary">
                Add Transaction
            </button>
        </form>
    )
}

export default TransactionForm
