'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

// Conexión directa para evitar errores de carga
const supabase = createClient(
  'https://cqlczrqyplidpxsjqqwr.supabase.co',
  'sb_publishable_0wjmKoJA2EFXZmJ7p0Vc_w_EKnJ0p9Q'
)

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleAuth = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    // 1. Intentamos iniciar sesión
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    // 2. Si el error es que el usuario no existe, lo registramos automáticamente
    if (signInError && (signInError.message.includes('Invalid login credentials') || signInError.status === 400)) {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) {
        setErrorMsg('Revisa tus datos o conexión')
        setLoading(false)
        return
      }
      
      // Tras registrarse, Supabase loguea en automático, mandamos al Dash
      router.push('/')
    } else if (signInError) {
      // Si es otro tipo de error (contraseña mal escrita de un usuario real)
      setErrorMsg('Credenciales incorrectas')
    } else {
      // Si todo bien, adentro
      router.push('/')
    }
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#000', fontFamily: 'sans-serif', padding: '20px' }}>
      
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: 'white', fontWeight: 900, fontSize: '48px', margin: 0, letterSpacing: '-2px' }}>CLIO</h1>
        <p style={{ color: '#555', fontWeight: 800, fontSize: '12px', letterSpacing: '4px' }}>BUSINESS MANAGER</p>
      </header>

      <div style={{ background: '#FFF', padding: '35px', borderRadius: '35px', width: '100%', maxWidth: '380px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
        
        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <input 
            type="email" 
            placeholder="Correo electrónico" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            style={inputStyle} 
            required 
          />

          <input 
            type="password" 
            placeholder="Contraseña" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            style={inputStyle} 
            required 
          />
          
          {/* Error elegante en pantalla, sin ventanas emergentes */}
          {errorMsg && <p style={{ color: '#FF3B30', fontSize: '11px', textAlign: 'center', fontWeight: 800, margin: '5px 0' }}>{errorMsg.toUpperCase()}</p>}

          <button disabled={loading} style={btnBlack}>
            {loading ? 'CONECTANDO...' : 'ENTRAR'}
          </button>
        </form>
      </div>
      
      <p style={{ marginTop: '30px', color: '#333', fontSize: '10px', fontWeight: 900 }}>v1.0 PREMIUM ACCESS</p>
    </div>
  )
}

// ====== ESTILOS REFORZADOS (Texto Negro Intenso) ======
const inputStyle = { 
  padding: '18px', 
  borderRadius: '16px', 
  border: '2px solid #EEE', 
  fontSize: '16px', 
  fontWeight: 600, 
  outline: 'none', 
  width: '100%', 
  boxSizing: 'border-box' as 'border-box', 
  color: '#000', 
  backgroundColor: '#FFF' 
}

const btnBlack = { 
  padding: '18px', 
  background: 'black', 
  color: 'white', 
  border: 'none', 
  borderRadius: '18px', 
  fontWeight: 800, 
  fontSize: '14px', 
  cursor: 'pointer', 
  letterSpacing: '1px', 
  marginTop: '5px' 
}