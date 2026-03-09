function Dashboard({ summary, loading }) {
    return (
        <section className="dashboard">
            <div className="summary-cards">
                <div className="card card-balance">
                    <div className="card-label">Total Balance</div>
                    <div className="card-value">
                        ${loading ? '...' : summary.balance.toFixed(2)}
                    </div>
                    <div className="card-icon">💵</div>
                </div>

                <div className="card card-income">
                    <div className="card-label">Total Income</div>
                    <div className="card-value">
                        ${loading ? '...' : summary.totalIncome.toFixed(2)}
                    </div>
                    <div className="card-icon">📈</div>
                </div>

                <div className="card card-expense">
                    <div className="card-label">Total Expenses</div>
                    <div className="card-value">
                        ${loading ? '...' : summary.totalExpenses.toFixed(2)}
                    </div>
                    <div className="card-icon">📉</div>
                </div>
            </div>
        </section>
    )
}

export default Dashboard
