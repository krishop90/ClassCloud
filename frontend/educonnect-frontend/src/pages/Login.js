'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
// Import the CSS file
import '../styles/Login.css'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:5001/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        alert('Login successful!')
        window.location.href = '/home'
      } else {
        alert(data.message || 'Login failed')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred during login.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-400 to-sky-600 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <img
              className="w-24 h-24 mx-auto mb-4"
              src="https://img.icons8.com/fluent/344/year-of-tiger.png"
              alt="Logo"
            />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
          <p className="text-gray-600 mt-2">Sign in to continue to your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="email">
              Email Address
            </label>
            <input
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-colors"
              type="email"
              name="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-colors"
              type="password"
              name="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-sky-500 text-white py-3 rounded-lg font-semibold hover:bg-sky-600 transition-colors duration-300"
          >
            Sign In
          </motion.button>
        </form>

        <div className="mt-8 flex items-center justify-between">
          <button 
            onClick={() => alert('Forgot Password functionality not implemented yet')} 
            className="text-sm text-sky-600 hover:text-sky-700 font-semibold transition-colors"
          >
            Forgot Password?
          </button>
          <a 
            href="/signup" 
            className="text-sm text-sky-600 hover:text-sky-700 font-semibold transition-colors"
          >
            Create Account
          </a>
        </div>
      </motion.div>
    </div>
  )
}

export default Login

