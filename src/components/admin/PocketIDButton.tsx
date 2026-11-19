// src/components/admin/PocketIDButton.tsx
'use client'
import React from 'react'

export default function PocketIDButton() {
  const handleLogin = () => {
    // State + PKCE dibuat di serverRoute /api/sso/start (crypto.randomBytes)
    // dan divalidasi ulang di callback. Client tidak pernah melihat secret.
    window.location.href = '/api/sso/start'
  }

  return (
    <div style={{ marginTop: '1.5rem', width: '100%' }}>
      <button
        onClick={handleLogin}
        type="button"
        style={{
          width: '100%',
          padding: '10px 16px',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          borderRadius: '6px',
          fontWeight: '600',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontSize: '14px',
        }}
      >
        🔑 Masuk dengan Pocket ID (SSO)
      </button>
    </div>
  )
}
