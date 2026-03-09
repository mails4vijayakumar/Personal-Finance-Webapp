function TransactionList({ transactions, onDelete }) {
    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            onDelete(id)
        }
    }

    return (
        <div className="transaction-list">
            <table className="transactions-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Description</th>
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
