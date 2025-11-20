import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/global.css'

// Initialize CSRF token on app load
async function initializeCsrfToken() {
  try {
    const { getCsrfToken, refreshCsrfToken } = await import('@utils/csrf')
    // Try to get existing token first
    let token = await getCsrfToken()
    
    // If no token, fetch a fresh one
    if (!token) {
      console.log('No CSRF token found, fetching from backend...')
      token = await refreshCsrfToken()
      if (token) {
        console.log('CSRF token initialized successfully')
      } else {
        console.warn('Failed to initialize CSRF token on app load')
      }
    } else {
      console.log('CSRF token found in storage')
    }
  } catch (error) {
    console.error('Failed to initialize CSRF token:', error)
  }
}

// Initialize CSRF token before rendering (don't block rendering)
initializeCsrfToken().catch(err => {
  console.error('CSRF initialization error:', err)
})

const container = document.getElementById('root')!
createRoot(container).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)


