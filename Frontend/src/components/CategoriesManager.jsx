import { useState } from 'react'
import { useCategories } from '../context/useCategories'
import CategoryForm from './CategoryForm'
import '../styles/Categories.css'

export default function CategoriesManager() {
    const { categories, loading, error, createCategory, updateCategory, deleteCategory } = useCategories()
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [deleteConfirm, setDeleteConfirm] = useState(null)
    const [operationError, setOperationError] = useState(null)
    const [deleteError, setDeleteError] = useState(null)

    const handleCreateCategory = async (name, colorHex) => {
        setOperationError(null)
        const result = await createCategory(name, colorHex)
        if (result.success) {
            setShowForm(false)
        } else {
            setOperationError(result.error)
        }
        return result
    }

    const handleUpdateCategory = async (name, colorHex) => {
        setOperationError(null)
        const result = await updateCategory(editingId, name, colorHex)
        if (result.success) {
            setEditingId(null)
        } else {
            setOperationError(result.error)
        }
        return result
    }

    const handleDeleteCategory = async (id) => {
        setDeleteError(null)
        const result = await deleteCategory(id)
        if (result.success) {
            setDeleteConfirm(null)
        } else {
            setDeleteError(result.error)
        }
    }

    const editingCategory = categories.find(c => c.id === editingId)

    return (
        <div className="categories-manager">
            <div className="categories-header">
                <h2>📂 Manage Categories</h2>
                {!showForm && !editingId && (
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setShowForm(true)}
                    >
                        + Add Category
                    </button>
                )}
            </div>

            {error && <div className="alert alert-error">Failed to load categories: {error}</div>}
            {operationError && <div className="alert alert-error">{operationError}</div>}
            {deleteError && <div className="alert alert-error">{deleteError}</div>}

            {showForm && (
                <CategoryForm
                    onSubmit={handleCreateCategory}
                    onCancel={() => setShowForm(false)}
                />
            )}

            {editingId && (
                <CategoryForm
                    initialCategory={editingCategory}
                    onSubmit={handleUpdateCategory}
                    onCancel={() => setEditingId(null)}
                />
            )}

            {loading && !showForm && !editingId ? (
                <div className="loading">Loading categories...</div>
            ) : categories.length === 0 ? (
                <div className="empty-state">
                    No categories yet. Create one to start organizing your transactions!
                </div>
            ) : (
                <div className="categories-grid">
                    {categories.map(category => (
                        <div key={category.id} className="category-card">
                            <div className="category-header">
                                <div className="category-color-name">
                                    <div
                                        className="category-color-dot"
                                        style={{ backgroundColor: category.colorHex }}
                                    ></div>
                                    <h4>{category.name}</h4>
                                </div>
                                <div className="category-actions">
                                    <button
                                        className="btn-icon btn-edit"
                                        onClick={() => setEditingId(category.id)}
                                        title="Edit category"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        className="btn-icon btn-delete"
                                        onClick={() => setDeleteConfirm(category.id)}
                                        title="Delete category"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>

                            {deleteConfirm === category.id && (
                                <div className="delete-confirmation">
                                    <p>Are you sure you want to delete this category?</p>
                                    <div className="confirmation-actions">
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleDeleteCategory(category.id)}
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
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
