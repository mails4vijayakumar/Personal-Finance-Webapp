import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'

export function useBudgets() {
    const { token } = useAuth()
    const [budgets, setBudgets] = useState([])
    const [budgetStatus, setBudgetStatus] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const API_URL = '/api'

    const fetchBudgets = async (month = null, year = null) => {
        if (!token) return

        try {
            setLoading(true)
            setError(null)

            let url = `${API_URL}/budgets`
            if (month && year) {
                url += `?month=${month}&year=${year}`
            }

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (!response.ok) {
                throw new Error('Failed to fetch budgets')
            }

            const data = await response.json()
            setBudgets(data)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const fetchBudgetStatus = async (month = null, year = null) => {
        if (!token) return

        try {
            let url = `${API_URL}/budgets/status`
            if (month && year) {
                url += `?month=${month}&year=${year}`
            }

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (!response.ok) {
                throw new Error('Failed to fetch budget status')
            }

            const data = await response.json()
            setBudgetStatus(data)
        } catch (err) {
            setError(err.message)
        }
    }

    const createBudget = async (categoryId, amount, month, year) => {
        if (!token) return { success: false, error: 'Not authenticated' }

        try {
            const response = await fetch(`${API_URL}/budgets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ categoryId, amount, month, year })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create budget')
            }

            setBudgets(prev => [...prev, data])
            return { success: true, data }
        } catch (err) {
            return { success: false, error: err.message }
        }
    }

    const updateBudget = async (id, amount) => {
        if (!token) return { success: false, error: 'Not authenticated' }

        try {
            const response = await fetch(`${API_URL}/budgets/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ amount })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update budget')
            }

            setBudgets(prev => prev.map(b => b.id === id ? data : b))
            return { success: true, data }
        } catch (err) {
            return { success: false, error: err.message }
        }
    }

    const deleteBudget = async (id) => {
        if (!token) return { success: false, error: 'Not authenticated' }

        try {
            const response = await fetch(`${API_URL}/budgets/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to delete budget')
            }

            setBudgets(prev => prev.filter(b => b.id !== id))
            return { success: true }
        } catch (err) {
            return { success: false, error: err.message }
        }
    }

    useEffect(() => {
        if (token) {
            const now = new Date()
            fetchBudgets(now.getMonth() + 1, now.getFullYear())
            fetchBudgetStatus(now.getMonth() + 1, now.getFullYear())
        }
    }, [token])

    return {
        budgets,
        budgetStatus,
        loading,
        error,
        fetchBudgets,
        fetchBudgetStatus,
        createBudget,
        updateBudget,
        deleteBudget
    }
}
