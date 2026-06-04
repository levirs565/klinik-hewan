import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import { dummyStaffUsers } from '../data/dummy'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    try {
      await login({
        username: String(formData.get('username') ?? ''),
        password: String(formData.get('password') ?? ''),
      })
      navigate('/', { replace: true })
    } catch {
      setError('Username atau password tidak valid.')
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-logo">VC</div>
        <p>VetConnect</p>
        <h1>Staff Portal</h1>
        <span>Manager, Receptionist, & Doctor Access</span>

        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Username</label>
          <div className="input-shell">
            <span className="material-symbols-outlined">person</span>
            <input id="username" name="username" placeholder="Enter username" defaultValue="receptionist" />
          </div>

          <label htmlFor="password">Password</label>
          <div className="input-shell">
            <span className="material-symbols-outlined">lock</span>
            <input id="password" name="password" type="password" placeholder="Enter password" defaultValue="password" />
          </div>

          {error ? <span className="form-error">{error}</span> : null}
          <button type="submit">Sign In</button>
        </form>

        <div className="dummy-accounts">
          <p>Dummy Accounts</p>
          {dummyStaffUsers.map((account) => (
            <button
              key={account.username}
              onClick={() => {
                void login({ username: account.username, password: 'password' }).then(() => navigate('/', { replace: true }))
              }}
              type="button"
            >
              <span>{account.role}</span>
              <strong>{account.username}</strong>
            </button>
          ))}
        </div>
      </section>
    </main>
  )
}
