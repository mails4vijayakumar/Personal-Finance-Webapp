import { useState, useEffect } from 'react'
import '../styles/TransactionFilters.css'

export default function TransactionFilters({
    categories,
    onFilter,
    onSearch,
    onReset
}) {
    const [searchTerm, setSearchTerm] = useState('')
    const [categoryId, setCategoryId] = useState('')
    const [type, setType] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [showAdvanced, setShowAdvanced] = useState(false)

    useEffect(() => {
        onSearch(searchTerm)
    }, [searchTerm])

    const handleFilterClick = () => {
        onFilter({
            categoryId: categoryId ? parseInt(categoryId) : null,
            type: type || null,
            startDate: startDate || null,
            endDate: endDate || null
        })
    }

    const handleReset = () => {
        setSearchTerm('')
        setCategoryId('')
        setType('')
        setStartDate('')
        setEndDate('')
        onReset()
    }

    return (
        <div className="transaction-filters">
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="🔍 Search transactions by description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            <button
                className="toggle-advanced"
                onClick={() => setShowAdvanced(!showAdvanced)}
            >
                {showAdvanced ? '▼ Hide Filters' : '▶ Show Filters'}
            </button>

            {showAdvanced && (
                <div className="advanced-filters">
                    <div className="filters-row">
                        <div className="filter-group">
                            <label htmlFor="filterType">Type</label>
                            <select
                                id="filterType"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="filter-select"
                            >
                                <option value="">All Types</option>
                                <option value="income">Income</option>
                                <option value="expense">Expense</option>
                            </select>
                        </div>

                        <div className="filter-group">
                            <label htmlFor="filterCategory">Category</label>
                            <select
                                id="filterCategory"
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                className="filter-select"
                            >
                                <option value="">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="filters-row">
                        <div className="filter-group">
                            <label htmlFor="filterStartDate">Start Date</label>
                            <input
                                id="filterStartDate"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="filter-date"
                            />
                        </div>

                        <div className="filter-group">
                            <label htmlFor="filterEndDate">End Date</label>
                            <input
                                id="filterEndDate"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="filter-date"
                            />
                        </div>
                    </div>

                    <div className="filter-actions">
                        <button
                            className="btn btn-primary"
                            onClick={handleFilterClick}
                        >
                            Apply Filters
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={handleReset}
                        >
                            Reset All
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
