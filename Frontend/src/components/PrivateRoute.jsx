import { useAuth } from '../context/useAuth'

export function PrivateRoute({ children }) {
    const { isAuthenticated, loading } = useAuth()

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading...</p>
            </div>
        )
    }

    if (!isAuthenticated) {
        return null // Will be redirected by App.jsx
    }

    return children
}
