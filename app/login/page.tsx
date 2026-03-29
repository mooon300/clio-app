'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/config' // cliente centralizado

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // ====== ENTRAR CON CONTRASEÑA ======
  const login = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert("Error: " + error.message)
    else router.push('/')
    setLoading(false)
  }

  // ====== REGISTRARSE (PARA USUARIOS NUEVOS) ======
  const registrarse = async () => {
    if (!email || !password) return alert("Pon correo y contraseña")
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) alert("Error al registrar: " + error.message)
    else alert("¡Registro exitoso! Ya puedes iniciar sesión con estos datos.")
    setLoading(false)
  }

  return (
    <div style={{ fontFamily: '-apple-system, sans-serif', padding: '50px 20px', maxWidth: '400px', margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', backgroundColor: 'black' }}>
      
      <h1 style={{ fontWeight: 900, fontSize: '42px', textAlign: 'center', marginBottom: '5px', color: 'white' }}>CLIO</h1>
      <p style={{ textAlign: 'center', color: '#555', marginBottom: '40px', fontWeight: 800, fontSize: '12px', letterSpacing: '3px' }}>BUSINESS MANAGER</p>

      <form onSubmit={login} style={{ display: 'flex', flexDirection: 'column', gap: '15px', background: 'white', padding: '30px', borderRadius: '30px' }}>
        
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={inputStyle} // Aquí arreglamos el color del texto
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={inputStyle}
        />

        <button type="submit" disabled={loading} style={btnStyle}>
          {loading ? 'Entrando...' : 'Iniciar sesión'}
        </button>

        <button type="button" onClick={registrarse} style={btnGhost}>
          ¿No tienes cuenta? Regístrate aquí
        </button>
      </form>
    </div>
  )
}

// ====== ESTILOS ======
const inputStyle = {
  width: '100%',
  padding: '14px',
  borderRadius: '14px',
  border: '1px solid #DDD',
  fontWeight: 600,
  fontSize: '16px',
  outline: 'none',
  boxSizing: 'border-box' as 'border-box',
  color: '#1D1D1F', // <-- ESTO arregla que el texto se vea negro
  backgroundColor: '#FFF'
}

const btnStyle = {
  width: '100%',
  padding: '16px',
  background: 'black',
  color: 'white',
  border: 'none',
  borderRadius: '16px',
  fontWeight: 700,
  cursor: 'pointer',
  fontSize: '15px'
}

const btnGhost = {
  background: 'none',
  border: 'none',
  color: '#8E8E93',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  marginTop: '5px'
}