'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// Conexión con las variables que ya configuramos en Vercel
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function ClioApp() {
  const [citas, setCitas] = useState<any[]>([])
  const [form, setForm] = useState({ nombre: '', monto: '' })
  const [loading, setLoading] = useState(false)

  // 1. Cargar las citas de la base de datos
  const fetchCitas = async () => {
    const { data, error } = await supabase
      .from('citas')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) console.error("Error cargando:", error.message)
    if (data) setCitas(data)
  }

  useEffect(() => { fetchCitas() }, [])

  // 2. Guardar nueva cita (Coincidiendo con tus columnas de Supabase)
  const guardar = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    
    const { error } = await supabase.from('citas').insert([{ 
      cliente_nombre: form.nombre.toUpperCase(), 
      monto: Number(form.monto), 
      estado: 'pendiente' 
    }])

    if (error) {
      alert("Error de Supabase: " + error.message)
    } else {
      setForm({ nombre: '', monto: '' }) // Limpia el formulario
      await fetchCitas() // Refresca la lista
    }
    setLoading(false)
  }

  // 3. Cambiar estado a pagado
  const cobrar = async (id: any) => {
    const { error } = await supabase.from('citas').update({ estado: 'pagado' }).eq('id', id)
    if (!error) fetchCitas()
  }

  // Cálculos rápidos
  const totalCaja = citas
    .filter(c => c.estado === 'pagado')
    .reduce((acc, c) => acc + (Number(c.monto) || 0), 0)

  return (
    <div style={{ fontFamily: '-apple-system, sans-serif', padding: '40px 20px', maxWidth: '450px', margin: '0 auto', backgroundColor: '#FBFBFB', minHeight: '100vh', color: '#1D1D1F' }}>
      
      {/* Header Estilo Apple */}
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ width: '55px', height: '55px', backgroundColor: 'black', borderRadius: '14px', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '26px' }}>C</div>
        <h1 style={{ fontWeight: 900, fontSize: '34px', margin: 0, letterSpacing: '-1.5px' }}>CLIO</h1>
        <p style={{ fontSize: '10px', fontWeight: 800, color: '#A1A1A6', letterSpacing: '3px', marginTop: '5px' }}>BUSINESS MANAGER</p>
      </header>

      {/* Resumen de Caja */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '24px', border: '1px solid #E5E5E7', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '10px', fontWeight: 800, color: '#86868B' }}>EN CAJA</p>
          <p style={{ margin: '5px 0 0', fontWeight: 900, fontSize: '24px', color: '#34C759' }}>${totalCaja}</p>
        </div>
        <div style={{ background: 'black', padding: '20px', borderRadius: '24px', color: 'white', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '10px', fontWeight: 800, color: '#86868B' }}>TOTAL CITAS</p>
          <p style={{ margin: '5px 0 0', fontWeight: 900, fontSize: '24px' }}>{citas.length}</p>
        </div>
      </div>
      
      {/* Formulario de Registro */}
      <form onSubmit={guardar} style={{ background: 'white', padding: '25px', borderRadius: '28px', border: '1px solid #E5E5E7', marginBottom: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <input style={{ width: '100%', padding: '16px', marginBottom: '12px', borderRadius: '14px', border: '1px solid #D2D2D7', fontWeight: 600, fontSize: '16px', boxSizing: 'border-box', outline: 'none' }} placeholder="Nombre del Cliente" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required />
        <input style={{ width: '100%', padding: '16px', marginBottom: '18px', borderRadius: '14px', border: '1px solid #D2D2D7', fontWeight: 600, fontSize: '16px', boxSizing: 'border-box', outline: 'none' }} type="number" placeholder="Monto $" value={form.monto} onChange={e => setForm({...form, monto: e.target.value})} required />
        <button disabled={loading} style={{ width: '100%', padding: '16px', background: 'black', color: 'white', border: 'none', borderRadius: '16px', fontWeight: 700, fontSize: '16px', cursor: 'pointer', opacity: loading ? 0.6 : 1, transition: '0.2s' }}>
          {loading ? 'REGISTRANDO...' : 'REGISTRAR'}
        </button>
      </form>

      {/* Lista de Citas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#86868B', marginLeft: '10px' }}>RECIENTES</h3>
        {citas.map(c => (
          <div key={c.id} style={{ background: 'white', padding: '20px', borderRadius: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #F2F2F7' }}>
            <div>
              <p style={{ margin: 0, fontWeight: 800, fontSize: '16px', color: '#1D1D1F' }}>{c.cliente_nombre}</p>
              <p style={{ margin: 0, fontSize: '11px', color: c.estado === 'pagado' ? '#34C759' : '#FF9500', fontWeight: 700 }}>${c.monto} • {c.estado.toUpperCase()}</p>
            </div>
            {c.estado === 'pendiente' && (
              <button onClick={() => cobrar(c.id)} style={{ background: '#F2F2F7', color: 'black', border: 'none', padding: '12px 18px', borderRadius: '12px', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}>COBRAR</button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}