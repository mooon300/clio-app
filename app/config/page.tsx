'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

// Cliente directo para evitar errores de rutas externas
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ConfigPage() {
  const router = useRouter()
  const [negocio, setNegocio] = useState<any>(null)
  const [servicios, setServicios] = useState<any[]>([])
  const [nuevoServicio, setNuevoServicio] = useState({ nombre: '', precio: '' })
  const [loading, setLoading] = useState(false)

  // ====== Cargar datos del negocio y servicios ======
  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/login')

    const { data: neg, error: negError } = await supabase
      .from('negocios')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle() 

    if (negError) return alert('Error cargando negocio: ' + negError.message)
    
    if (!neg) {
      alert("Crea un negocio primero en el inicio")
      return router.push('/')
    }

    setNegocio(neg)

    const { data: servs } = await supabase
      .from('servicios')
      .select('*')
      .eq('negocio_id', neg.id)
    setServicios(servs || [])
  }

  useEffect(() => { loadData() }, [])

  // ====== Actualizar datos del negocio (Nombre/WhatsApp) ======
  const actualizarNegocio = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase
      .from('negocios')
      .update({ nombre: negocio.nombre, whatsapp: negocio.whatsapp })
      .eq('id', negocio.id)
    
    if (error) alert(error.message)
    else alert("¡Datos actualizados!")
    setLoading(false)
  }

  // ====== Agregar servicio ======
  const agregarServicio = async (e: any) => {
    e.preventDefault()
    if (!negocio) return

    const { error } = await supabase.from('servicios').insert([{
      negocio_id: negocio.id,
      nombre: nuevoServicio.nombre,
      precio: Number(nuevoServicio.precio)
    }])

    if (!error) {
      setNuevoServicio({ nombre: '', precio: '' })
      loadData()
    } else {
      alert("Error agregando servicio: " + error.message)
    }
  }

  // ====== Eliminar servicio ======
  const eliminarServicio = async (id: any) => {
    const { error } = await supabase.from('servicios').delete().eq('id', id)
    if (!error) loadData()
    else alert("Error eliminando servicio: " + error.message)
  }

  if (!negocio) return <p style={{ textAlign:'center', padding:'50px', fontFamily: 'sans-serif' }}>Cargando configuración...</p>

  return (
    <div style={{ fontFamily: '-apple-system, sans-serif', padding: '40px 20px', maxWidth: '450px', margin: '0 auto', minHeight: '100vh', backgroundColor: '#FBFBFB' }}>
      
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ fontWeight: 900, fontSize: '28px', letterSpacing: '-1px', margin: 0 }}>Configuración ⚙️</h1>
        <p style={{ color: '#8E8E93', fontSize: '14px' }}>Ajusta los detalles de tu negocio</p>
      </header>

      {/* SECCIÓN 1: DATOS DEL NEGOCIO */}
      <form onSubmit={actualizarNegocio} style={formStyle}>
        <h3 style={sectionTitle}>PERFIL DEL NEGOCIO</h3>
        <input
          style={inputStyle}
          placeholder="Nombre del Negocio"
          value={negocio.nombre}
          onChange={e => setNegocio({ ...negocio, nombre: e.target.value })}
          required
        />
        <input
          style={inputStyle}
          placeholder="WhatsApp del Negocio"
          value={negocio.whatsapp}
          onChange={e => setNegocio({ ...negocio, whatsapp: e.target.value })}
          required
        />
        <button disabled={loading} style={{...btnStyle, background: '#007AFF'}}>GUARDAR CAMBIOS</button>
      </form>

      {/* SECCIÓN 2: FORMULARIO AGREGAR SERVICIO */}
      <form onSubmit={agregarServicio} style={formStyle}>
        <h3 style={sectionTitle}>AÑADIR AL MENÚ</h3>
        <input
          style={inputStyle}
          placeholder="Ej: Corte de Caballero"
          value={nuevoServicio.nombre}
          onChange={e => setNuevoServicio({ ...nuevoServicio, nombre: e.target.value })}
          required
        />
        <input
          style={inputStyle}
          type="number"
          placeholder="Precio $"
          value={nuevoServicio.precio}
          onChange={e => setNuevoServicio({ ...nuevoServicio, precio: e.target.value })}
          required
        />
        <button style={btnStyle}>AÑADIR SERVICIO</button>
      </form>

      {/* SECCIÓN 3: LISTA DE SERVICIOS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h3 style={sectionTitle}>TU MENÚ ACTUAL</h3>
        {servicios.map(s => (
          <div key={s.id} style={itemStyle}>
            <div>
              <p style={{ margin: 0, fontWeight: 700 }}>{s.nombre}</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#34C759', fontWeight: 800 }}>${s.precio}</p>
            </div>
            <button onClick={() => eliminarServicio(s.id)} style={btnDelete}>BORRAR</button>
          </div>
        ))}
      </div>

      <button
        onClick={() => router.push('/')}
        style={{ width: '100%', marginTop: '40px', background: 'none', border: 'none', color: '#007AFF', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}
      >
        ← Volver al Dashboard
      </button>
    </div>
  )
}

// ====== ESTILOS (Tus originales + mejoras) ======
const sectionTitle = { fontSize: '11px', fontWeight: 800, color: '#8E8E93', marginBottom: '15px', letterSpacing: '1px' }

const formStyle = {
  background: 'white',
  padding: '20px',
  borderRadius: '24px',
  border: '1px solid #E5E5E7',
  marginBottom: '20px'
}

const inputStyle = {
  width: '100%',
  padding: '12px',
  marginBottom: '10px',
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

const itemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '15px',
  borderRadius: '20px',
  background: 'white',
  border: '1px solid #F2F2F7'
}

const btnDelete = {
  background: '#FF3B3015',
  color: '#FF3B30',
  border: 'none',
  borderRadius: '10px',
  padding: '8px 12px',
  fontSize: '10px',
  fontWeight: 800,
  cursor: 'pointer'
}