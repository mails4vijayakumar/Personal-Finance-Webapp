import { useState } from 'react'
import { useAuth } from '../context/useAuth'
import '../styles/Auth.css'

export default function Login({ onSwitchToRegister }) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const { login } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        if (!username.trim() || !password.trim()) {
            setError('Username and password are required')
            setLoading(false)
            return
        }

        const result = await login(username, password)
        if (!result.success) {
            setError(result.error)
        }
        setLoading(false)
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>💰 Personal Finance Tracker</h1>
                <h2>Login</h2>

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={loading}
                            autoComplete="username"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-full"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Don't have an account?
                        <button
                            type="button"
                            className="link-button"
                            onClick={onSwitchToRegister}
                        >
                            Register here
                        </button>
                    </p>
                </div>
            </div>
        </div>
    )
}
