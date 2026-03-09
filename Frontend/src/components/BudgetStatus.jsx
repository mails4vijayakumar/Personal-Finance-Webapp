import '../styles/Budgets.css'

export default function BudgetStatus({ statusData }) {
    if (!statusData) {
        return <div className="loading">Loading budget status...</div>
    }

    const getProgressColor = (percentage) => {
        if (percentage <= 50) return '#4caf50' // Green
        if (percentage <= 80) return '#ff9800' // Orange
        return '#ff4336' // Red
    }

    return (
        <div className="budget-status-container">
            <div className="budget-summary">
                <div className="summary-card">
                    <div className="summary-label">Total Budget</div>
                    <div className="summary-value">${statusData.totalBudget.toFixed(2)}</div>
                </div>

                <div className="summary-card">
                    <div className="summary-label">Total Spending</div>
                    <div className="summary-value">${statusData.totalSpending.toFixed(2)}</div>
                </div>

                <div className="summary-card">
                    <div className="summary-label">Remaining</div>
                    <div className={`summary-value ${statusData.totalRemaining < 0 ? 'over-budget' : ''}`}>
                        ${statusData.totalRemaining.toFixed(2)}
                    </div>
                </div>
            </div>

            <div className="overall-progress">
                <div className="progress-info">
                    <span>Overall Budget Usage: {statusData.totalPercentageUsed.toFixed(1)}%</span>
                </div>
                <div className="progress-bar-container">
                    <div
                        className="progress-bar"
                        style={{
                            width: `${Math.min(statusData.totalPercentageUsed, 100)}%`,
                            backgroundColor: getProgressColor(statusData.totalPercentageUsed)
                        }}
                    ></div>
                </div>
            </div>

            {statusData.items && statusData.items.length > 0 && (
                <div className="budget-items">
                    <h3>Category Budgets</h3>
                    <div className="budget-items-grid">
                        {statusData.items.map(item => (
                            <div key={item.budgetId} className="budget-item">
                                <div className="budget-item-header">
                                    <h4>{item.categoryName}</h4>
                                    {item.isOverBudget && (
                                        <span className="over-budget-badge">Over Budget</span>
                                    )}
                                </div>

                                <div className="budget-amounts">
                                    <div className="amount-row">
                                        <span className="label">Budget:</span>
                                        <span className="value">${item.budgetAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="amount-row">
                                        <span className="label">Spent:</span>
                                        <span className={`value ${item.isOverBudget ? 'over' : ''}`}>
                                            ${item.spending.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="amount-row">
                                        <span className="label">Remaining:</span>
                                        <span className={`value ${item.remaining < 0 ? 'over' : 'under'}`}>
                                            ${item.remaining.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                <div className="budget-progress">
                                    <div className="progress-bar-container">
                                        <div
                                            className="progress-bar"
                                            style={{
                                                width: `${Math.min(item.percentageUsed, 100)}%`,
                                                backgroundColor: getProgressColor(item.percentageUsed)
                                            }}
                                        ></div>
                                    </div>
                                    <div className="progress-label">
                                        {item.percentageUsed.toFixed(1)}% Used
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
