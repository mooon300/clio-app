'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// Estas variables se conectan con tu Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function ClioApp() {
  const [citas, setCitas] = useState<any[]>([])
  const [form, setForm] = useState({ nombre: '', monto: '' })

  // Función para traer los datos de la base de datos
  const fetchCitas = async () => {
    if (!supabaseUrl) return
    const { data } = await supabase.from('citas').select('*').order('created_at', { ascending: false })
    if (data) setCitas(data)
  }

  useEffect(() => { fetchCitas() }, [])

  // Función para guardar una nueva cita
  const guardar = async (e: any) => {
    e.preventDefault()
    const { error } = await supabase.from('citas').insert([{ 
      cliente_nombre: form.nombre.toUpperCase(), 
      monto: Number(form.monto), 
      estado: 'pendiente' 
    }])
    if (!error) {
      setForm({ nombre: '', monto: '' })
      fetchCitas()
    }
  }

  // Función para marcar como pagado
  const cobrar = async (id: any) => {
    await supabase.from('citas').update({ estado: 'pagado' }).eq('id', id)
    fetchCitas()
  }

  // Cálculo del dinero en caja
  const totalCaja = citas.filter(c => c.estado === 'pagado').reduce((acc, c) => acc + (Number(c.monto) || 0), 0)

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', padding: '40px 20px', maxWidth: '450px', margin: '0 auto', backgroundColor: '#FBFBFB', minHeight: '100vh', color: '#1D1D1F' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ width: '50px', height: '50px', backgroundColor: 'black', borderRadius: '12px', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '24px', fontStyle: 'italic' }}>C</div>
        <h1 style={{ fontWeight: 900, letterSpacing: '-1.5px', fontSize: '32px', margin: 0 }}>CLIO</h1>
        <p style={{ fontSize: '10px', fontWeight: 800, color: '#999', letterSpacing: '3px', marginTop: '5px' }}>BUSINESS MANAGER</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '25px', border: '1px solid #EEE', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '9px', fontWeight: 900, color: '#999' }}>CAJA</p>
          <p style={{ margin: '5px 0 0', fontWeight: 900, fontSize: '22px', color: '#10b981' }}>${totalCaja}</p>
        </div>
        <div style={{ background: 'black', padding: '20px', borderRadius: '25px', color: 'white', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '9px', fontWeight: 900, color: '#555' }}>TOTAL</p>
          <p style={{ margin: '5px 0 0', fontWeight: 900, fontSize: '22px' }}>{citas.length}</p>
        </div>
      </div>
      
      <form onSubmit={guardar} style={{ background: 'white', padding: '25px', borderRadius: '30px', border: '1px solid #EEE', marginBottom: '30px', boxShadow: '0 10px 40px rgba(0,0,0,0.02)' }}>
        <input style={{ width: '100%', padding: '15px', marginBottom: '10px', borderRadius: '12px', border: '1px solid #EEE', fontWeight: 700, boxSizing: 'border-box', outline: 'none' }} placeholder="NOMBRE" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required />
        <input style={{ width: '100%', padding: '15px', marginBottom: '15px', borderRadius: '12px', border: '1px solid #EEE', fontWeight: 700, boxSizing: 'border-box', outline: 'none' }} type="number" placeholder="MONTO $" value={form.monto} onChange={e => setForm({...form, monto: e.target.value})} required />
        <button style={{ width: '100%', padding: '15px', background: 'black', color: 'white', border: 'none', borderRadius: '15px', fontWeight: 900, cursor: 'pointer', transition: '0.2s' }}>REGISTRAR</button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {citas.map(c => (
          <div key={c.id} style={{ background: 'white', padding: '18px', borderRadius: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #F0F0F0' }}>
            <div>
              <p style={{ margin: 0, fontWeight: 900, fontSize: '15px', textTransform: 'uppercase' }}>{c.cliente_nombre}</p>
              <p style={{ margin: 0, fontSize: '10px', color: '#10b981', fontWeight: 800 }}>${c.monto} • {c.estado.toUpperCase()}</p>
            </div>
            {c.estado === 'pendiente' && (
              <button onClick={() => cobrar(c.id)} style={{ background: '#F5F5F7', color: 'black', border: 'none', padding: '10px 15px', borderRadius: '10px', fontSize: '10px', fontWeight: 900, cursor: 'pointer' }}>PAGAR</button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}