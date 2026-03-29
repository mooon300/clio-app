'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/config' // cliente centralizado

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  // ====== ESTO ES LO QUE COMPLEMENTA EL LOGIN ======
  // Detecta si el usuario ya entró (por el link del correo) y lo manda al Dash
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/')
      }
    })
    return () => subscription.unsubscribe()
  }, [router])

  // ====== Login con OTP ======
  const login = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) alert(error.message)
    else alert('Revisa tu email para iniciar sesión')
    setLoading(false)
  }

  return (
    <div style={{ fontFamily: '-apple-system, sans-serif', padding: '50px 20px', maxWidth: '400px', margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <h1 style={{ fontWeight: 900, fontSize: '32px', textAlign: 'center', marginBottom: '5px' }}>CLIO</h1>
      <p style={{ textAlign: 'center', color: '#8E8E93', marginBottom: '30px', fontWeight: 600 }}>BUSINESS MANAGER</p>

      <form onSubmit={login} style={{ display: 'flex', flexDirection: 'column', gap: '15px', background: 'white', padding: '25px', borderRadius: '24px', border: '1px solid #E5E5E7', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={inputStyle}
        />
        <button type="submit" disabled={loading} style={btnStyle}>
          {loading ? 'Enviando...' : 'Iniciar sesión'}
        </button>
      </form>
    </div>
  )
}

// ====== ESTILOS (Tus estilos originales) ======
const inputStyle = {
  width: '100%',
  padding: '12px',
  borderRadius: '12px',
  border: '1px solid #D2D2D7',
  fontWeight: 600,
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box' as 'border-box'
}

const btnStyle = {
  width: '100%',
  padding: '14px',
  background: 'black',
  color: 'white',
  border: 'none',
  borderRadius: '14px',
  fontWeight: 700,
  cursor: 'pointer'
}