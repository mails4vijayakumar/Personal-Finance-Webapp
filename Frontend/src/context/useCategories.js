import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'

export function useCategories() {
    const { token } = useAuth()
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const API_URL = '/api'

    const fetchCategories = async () => {
        if (!token) return

        try {
            setLoading(true)
            setError(null)
            const response = await fetch(`${API_URL}/categories`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (!response.ok) {
                throw new Error('Failed to fetch categories')
            }

            const data = await response.json()
            setCategories(data)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const createCategory = async (name, colorHex) => {
        if (!token) return { success: false, error: 'Not authenticated' }

        try {
            const response = await fetch(`${API_URL}/categories`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, colorHex })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create category')
            }

            setCategories(prev => [...prev, data])
            return { success: true, data }
        } catch (err) {
            return { success: false, error: err.message }
        }
    }

    const updateCategory = async (id, name, colorHex) => {
        if (!token) return { success: false, error: 'Not authenticated' }

        try {
            const response = await fetch(`${API_URL}/categories/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, colorHex })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update category')
            }

            setCategories(prev => prev.map(c => c.id === id ? data : c))
            return { success: true, data }
        } catch (err) {
            return { success: false, error: err.message }
        }
    }

    const deleteCategory = async (id) => {
        if (!token) return { success: false, error: 'Not authenticated' }

        try {
            const response = await fetch(`${API_URL}/categories/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to delete category')
            }

            setCategories(prev => prev.filter(c => c.id !== id))
            return { success: true }
        } catch (err) {
            return { success: false, error: err.message }
        }
    }

    useEffect(() => {
        if (token) {
            fetchCategories()
        }
    }, [token])

    return {
        categories,
        loading,
        error,
        fetchCategories,
        createCategory,
        updateCategory,
        deleteCategory
    }
}
