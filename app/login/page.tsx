'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

// Llaves directas para que funcione sí o sí en Vercel
const supabase = createClient(
  'https://cqlczrqyplidpxsjqqwr.supabase.co',
  'sb_publishable_0wjmKoJA2EFXZmJ7p0Vc_w_EKnJ0p9Q'
)

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)

  // ====== FUNCIÓN PARA LOGIN / REGISTRO ======
  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)

    if (isRegistering) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) alert("Error: " + error.message)
      else alert("¡Registro exitoso! Ahora cambia a 'Entrar' para iniciar sesión.")
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) alert("Error: " + error.message)
      else router.push('/')
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
        
        {/* Selector de Modo con colores fuertes */}
        <div style={{ display: 'flex', background: '#F2F2F7', borderRadius: '15px', padding: '5px', marginBottom: '25px' }}>
          <button 
            type="button"
            onClick={() => setIsRegistering(false)} 
            style={{ ...tabBtn, backgroundColor: !isRegistering ? '#000' : 'transparent', color: !isRegistering ? '#FFF' : '#666' }}
          >Entrar</button>
          <button 
            type="button"
            onClick={() => setIsRegistering(true)} 
            style={{ ...tabBtn, backgroundColor: isRegistering ? '#000' : 'transparent', color: isRegistering ? '#FFF' : '#666' }}
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
            {loading ? 'PROCESANDO...' : (isRegistering ? 'CREAR CUENTA' : 'INICIAR SESIÓN')}
          </button>
        </form>
      </div>
      
      <p style={{ marginTop: '30px', color: '#333', fontSize: '10px', fontWeight: 900 }}>v1.0 PREMIUM ACCESS</p>
    </div>
  )
}

// ====== ESTILOS REFORZADOS ======
const tabBtn = { flex: 1, border: 'none', padding: '12px', borderRadius: '12px', fontSize: '14px', fontWeight: 800, cursor: 'pointer', transition: '0.3s' }
const inputStyle = { padding: '18px', borderRadius: '16px', border: '2px solid #EEE', fontSize: '16px', fontWeight: 600, outline: 'none', width: '100%', boxSizing: 'border-box' as 'border-box', color: '#000', backgroundColor: '#FFF' }
const btnBlack = { padding: '18px', background: 'black', color: 'white', border: 'none', borderRadius: '18px', fontWeight: 800, fontSize: '14px', cursor: 'pointer', letterSpacing: '1px', marginTop: '10px' }