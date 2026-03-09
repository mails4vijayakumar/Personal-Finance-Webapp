import { createContext, useState, useEffect } from 'react'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const API_URL = '/api'

    // Check if user is already logged in on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('token')
        if (storedToken) {
            setToken(storedToken)
            // Fetch user profile to verify token is valid
            verifyToken(storedToken)
        } else {
            setLoading(false)
        }
    }, [])

    const verifyToken = async (tok) => {
        try {
            const response = await fetch(`${API_URL}/auth/profile`, {
                headers: {
                    'Authorization': `Bearer ${tok}`
                }
            })

            if (response.ok) {
                const userData = await response.json()
                setUser(userData)
            } else {
                // Token is invalid
                localStorage.removeItem('token')
                setToken(null)
                setUser(null)
            }
        } catch (err) {
            console.error('Failed to verify token:', err)
            localStorage.removeItem('token')
            setToken(null)
            setUser(null)
        } finally {
            setLoading(false)
        }
    }

    const register = async (username, email, password) => {
        try {
            setError(null)
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed')
            }

            // Store token and set user
            localStorage.setItem('token', data.token)
            setToken(data.token)
            setUser(data.user)

            return { success: true, data }
        } catch (err) {
            setError(err.message)
            return { success: false, error: err.message }
        }
    }

    const login = async (username, password) => {
        try {
            setError(null)
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Login failed')
            }

            // Store token and set user
            localStorage.setItem('token', data.token)
            setToken(data.token)
            setUser(data.user)

            return { success: true, data }
        } catch (err) {
            setError(err.message)
            return { success: false, error: err.message }
        }
    }

    const logout = () => {
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
        setError(null)
    }

    const isAuthenticated = !!token && !!user

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            error,
            isAuthenticated,
            register,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    )
}
