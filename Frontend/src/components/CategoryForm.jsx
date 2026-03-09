import { useState, useEffect } from 'react'
import '../styles/Categories.css'

export default function CategoryForm({ onSubmit, onCancel, initialCategory = null }) {
    const [name, setName] = useState('')
    const [colorHex, setColorHex] = useState('#e0e0e0')
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (initialCategory) {
            setName(initialCategory.name)
            setColorHex(initialCategory.colorHex || '#e0e0e0')
        }
    }, [initialCategory])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)

        if (!name.trim()) {
            setError('Category name is required')
            return
        }

        setLoading(true)
        const result = await onSubmit(name.trim(), colorHex)
        setLoading(false)

        if (result.success) {
            setName('')
            setColorHex('#e0e0e0')
        } else {
            setError(result.error)
        }
    }

    return (
        <div className="category-form-container">
            <h3>{initialCategory ? 'Edit Category' : 'Add New Category'}</h3>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit} className="category-form">
                <div className="form-group">
                    <label htmlFor="categoryName">Category Name</label>
                    <input
                        id="categoryName"
                        type="text"
                        placeholder="e.g., Groceries, Rent, Entertainment"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="categoryColor">Color</label>
                    <div className="color-picker-group">
                        <input
                            id="categoryColor"
                            type="color"
                            value={colorHex}
                            onChange={(e) => setColorHex(e.target.value)}
                            disabled={loading}
                            className="color-picker"
                        />
                        <span
                            className="color-preview"
                            style={{ backgroundColor: colorHex }}
                        ></span>
                    </div>
                </div>

                <div className="form-actions">
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : initialCategory ? 'Update' : 'Add Category'}
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
