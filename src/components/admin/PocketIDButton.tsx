// src/components/admin/PocketIDButton.tsx
'use client'
import React from 'react'

export default function PocketIDButton() {
  const handleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_OIDC_CLIENT_ID || ''
    const redirectUri = encodeURIComponent(`${window.location.origin}/api/sso/callback`)
    const authorizeEndpoint = 'https://apps.oplay.id/authorize'

    // 👇 BUAT STRING ACAK MINIMAL 8 KARAKTER UNTUK PARAMETER 'state'
    const state =
      Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

    // Arahkan browser dengan menyertakan parameter state
    window.location.href = `${authorizeEndpoint}?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=openid%20profile%20email&state=${state}`
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
