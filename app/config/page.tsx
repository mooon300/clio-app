'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/config' // ruta correcta al cliente Supabase

export default function ConfigPage() {
  const router = useRouter()
  const [negocio, setNegocio] = useState<any>(null)
  const [servicios, setServicios] = useState<any[]>([])
  const [nuevoServicio, setNuevoServicio] = useState({ nombre: '', precio: '' })

  // ====== Cargar datos del negocio y servicios ======
  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/login')

    const { data: neg, error: negError } = await supabase
      .from('negocios')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (negError) return alert('Error cargando negocio: ' + negError.message)
    setNegocio(neg)

    const { data: servs } = await supabase
      .from('servicios')
      .select('*')
      .eq('negocio_id', neg.id)
    setServicios(servs || [])
  }

  useEffect(() => { loadData() }, [])

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

  if (!negocio) return <p style={{ textAlign:'center', padding:'50px' }}>Cargando configuración...</p>

  return (
    <div style={{ fontFamily: '-apple-system, sans-serif', padding: '40px 20px', maxWidth: '450px', margin: '0 auto' }}>
      <h1 style={{ fontWeight: 900, fontSize: '28px', letterSpacing: '-1px' }}>Configuración ⚙️</h1>
      <p style={{ color: '#8E8E93', marginBottom: '30px' }}>Gestiona el menú de {negocio.nombre}</p>

      {/* Formulario Agregar Servicio */}
      <form onSubmit={agregarServicio} style={formStyle}>
        <h3 style={{ fontSize: '12px', color: '#8E8E93', marginBottom: '10px' }}>AGREGAR SERVICIO AL MENÚ</h3>
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
        <button style={btnStyle}>AÑADIR AL MENÚ</button>
      </form>

      {/* Lista de Servicios */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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

      {/* Botón volver */}
      <button
        onClick={() => router.push('/')}
        style={{ width: '100%', marginTop: '30px', background: 'none', border: 'none', color: '#007AFF', fontWeight: 700, cursor: 'pointer' }}
      >
        ← Volver al Dashboard
      </button>
    </div>
  )
}

// ====== ESTILOS ======
const formStyle = {
  background: 'white',
  padding: '20px',
  borderRadius: '24px',
  border: '1px solid #E5E5E7',
  marginBottom: '30px'
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
  background: '#F2F2F7'
}

const btnDelete = {
  background: '#FF3B30',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  padding: '5px 10px',
  fontSize: '10px',
  fontWeight: 800,
  cursor: 'pointer'
}