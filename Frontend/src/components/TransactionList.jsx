function TransactionList({ transactions, onDelete, categories = [] }) {
    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const getCategoryName = (categoryId) => {
        if (!categoryId || !categories) return 'Uncategorized'
        const category = categories.find(c => c.id === categoryId)
        return category ? category.name : 'Uncategorized'
    }

    const getCategoryColor = (categoryId) => {
        if (!categoryId || !categories) return '#e0e0e0'
        const category = categories.find(c => c.id === categoryId)
        return category ? category.colorHex : '#e0e0e0'
    }

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            onDelete(id)
        }
    }

    if (transactions.length === 0) {
        return (
            <div className="transaction-list">
                <div className="empty-state">No transactions found</div>
            </div>
        )
    }

    return (
        <div className="transaction-list">
            <table className="transactions-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Category</th>
                        <th>Amount</th>
                        <th>Type</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map(transaction => (
                        <tr key={transaction.id} className={`row-${transaction.type}`}>
                            <td>{formatDate(transaction.date)}</td>
                            <td>{transaction.description}</td>
                            <td>
                                <span 
                                    className="category-badge"
                                    style={{ 
                                        backgroundColor: getCategoryColor(transaction.categoryId),
                                        color: '#000000'
                                    }}
                                >
                                    {getCategoryName(transaction.categoryId)}
                                </span>
                            </td>
                            <td className={transaction.type === 'income' ? 'text-income' : 'text-expense'}>
                                {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                            </td>
                            <td>
                                <span className={`badge badge-${transaction.type}`}>
                                    {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                                </span>
                            </td>
                            <td>
                                <button
                                    className="btn btn-delete"
                                    onClick={() => handleDelete(transaction.id)}
                                    title="Delete transaction"
                                >
                                    🗑️
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default TransactionList
