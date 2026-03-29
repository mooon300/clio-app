'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/config'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false) // Estado para cambiar el modo

  // ====== FUNCIÓN PRINCIPAL (Login o Registro) ======
  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)

    if (isRegistering) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) alert("Error: " + error.message)
      else alert("¡Registro exitoso! Ahora cambia a 'Iniciar Sesión' para entrar.")
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) alert("Error: " + error.message)
      else router.push('/')
    }
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: 'black', fontFamily: '-apple-system, sans-serif', padding: '20px' }}>
      
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: 'white', fontWeight: 900, fontSize: '48px', margin: 0, letterSpacing: '-2px' }}>CLIO</h1>
        <p style={{ color: '#555', fontWeight: 800, fontSize: '12px', letterSpacing: '4px' }}>BUSINESS MANAGER</p>
      </header>

      <div style={{ background: 'white', padding: '35px', borderRadius: '35px', width: '100%', maxWidth: '380px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
        
        {/* Selector de Modo */}
        <div style={{ display: 'flex', background: '#F2F2F7', borderRadius: '12px', padding: '4px', marginBottom: '25px' }}>
          <button 
            onClick={() => setIsRegistering(false)} 
            style={{ ...tabBtn, backgroundColor: !isRegistering ? 'white' : 'transparent', boxShadow: !isRegistering ? '0 2px 8px rgba(0,0,0,0.1)' : 'none' }}
          >Entrar</button>
          <button 
            onClick={() => setIsRegistering(true)} 
            style={{ ...tabBtn, backgroundColor: isRegistering ? 'white' : 'transparent', boxShadow: isRegistering ? '0 2px 8px rgba(0,0,0,0.1)' : 'none' }}
          >Registrar</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
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
          
          <button disabled={loading} style={btnBlack}>
            {loading ? 'Procesando...' : (isRegistering ? 'CREAR CUENTA' : 'INICIAR SESIÓN')}
          </button>
        </form>
      </div>
      
      <p style={{ marginTop: '30px', color: '#333', fontSize: '10px', fontWeight: 900 }}>v1.0 PREMIUM ACCESS</p>
    </div>
  )
}

// ====== ESTILOS ======
const tabBtn = { flex: 1, border: 'none', padding: '8px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: '0.2s' }
const inputStyle = { padding: '18px', borderRadius: '16px', border: '1px solid #EEE', fontSize: '16px', fontWeight: 600, outline: 'none', width: '100%', boxSizing: 'border-box' as 'border-box', color: '#1D1D1F', backgroundColor: '#FFF' }
const btnBlack = { padding: '18px', background: 'black', color: 'white', border: 'none', borderRadius: '18px', fontWeight: 800, fontSize: '14px', cursor: 'pointer', letterSpacing: '1px', marginTop: '10px' }