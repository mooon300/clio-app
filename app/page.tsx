'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Dashboard() {
  const router = useRouter()
  const [citas, setCitas] = useState<any[]>([])
  const [servicios, setServicios] = useState<any[]>([])
  const [negocio, setNegocio] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [nombreNuevoNegocio, setNombreNuevoNegocio] = useState('') // Para usuarios nuevos

  const [form, setForm] = useState({
    servicio_id: '',
    cliente_nombre: '',
    monto: '',
    whatsapp: '',
    fecha: '',
    hora: ''
  })

  // ===== FETCH DATA =====
  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/login')

    const { data: neg } = await supabase
      .from('negocios')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle() // Cambiado a maybeSingle para que no truene si no hay uno

    if (neg) {
      setNegocio(neg)
      const { data: servs } = await supabase.from('servicios').select('*').eq('negocio_id', neg.id)
      setServicios(servs || [])
      const { data: cts } = await supabase.from('citas').select('*, servicio_id(nombre)').eq('negocio_id', neg.id).order('fecha_hora', { ascending: false })
      setCitas(cts || [])
    }
  }

  useEffect(() => { fetchData() }, [])

  // ===== CREAR NEGOCIO (PARA NUEVOS) =====
  const crearNegocioInicial = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !nombreNuevoNegocio) return
    
    setLoading(true)
    const { error } = await supabase.from('negocios').insert([{
      user_id: user.id,
      nombre: nombreNuevoNegocio,
      modo: 'citas'
    }])
    
    if (!error) fetchData()
    else alert("Error creando negocio: " + error.message)
    setLoading(false)
  }

  // ===== LOGOUT =====
  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // ===== GUARDAR NUEVA CITA =====
  const guardar = async (e: any) => {
    e.preventDefault()
    if (!negocio) return
    setLoading(true)
    const fechaHoraISO = `${form.fecha}T${form.hora}:00`

    const { error } = await supabase.from('citas').insert([{
      negocio_id: negocio.id,
      servicio_id: Number(form.servicio_id),
      cliente_nombre: form.cliente_nombre.toUpperCase(),
      cliente_whatsapp: form.whatsapp,
      monto: Number(form.monto),
      fecha_hora: fechaHoraISO,
      estado: 'pendiente'
    }])

    if (error) alert("Error: " + error.message)
    else {
      setForm({ servicio_id: '', cliente_nombre: '', monto: '', whatsapp: '', fecha: '', hora: '' })
      fetchData()
    }
    setLoading(false)
  }

  // ===== COBRAR =====
  const cobrar = async (id: any) => {
    await supabase.from('citas').update({ estado: 'pagado' }).eq('id', id)
    fetchData()
  }

  const totalCaja = citas.filter(c => c.estado === 'pagado').reduce((acc, c) => acc + (Number(c.monto) || 0), 0)

  const formatFechaHora = (iso: string) => {
    const date = new Date(iso)
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    return date.toLocaleString('es-ES', options)
  }

  // ======= RENDER PARA USUARIOS SIN NEGOCIO =======
  if (!negocio && !loading) {
    return (
      <div style={{ padding: '50px 20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h2 style={{fontWeight: 900}}>¡Bienvenido a CLIO!</h2>
        <p style={{color: '#666'}}>Para empezar, dinos el nombre de tu negocio:</p>
        <input style={inputStyle} placeholder="Ej: Barbería Morales" value={nombreNuevoNegocio} onChange={e => setNombreNuevoNegocio(e.target.value)} />
        <button onClick={crearNegocioInicial} style={buttonStyle}>CREAR MI NEGOCIO</button>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: '-apple-system, sans-serif', padding: '40px 20px', maxWidth: '500px', margin: '0 auto', backgroundColor: '#FBFBFB', minHeight: '100vh' }}>
      
      {/* HEADER */}
      <header style={{ textAlign: 'center', marginBottom: '30px', position: 'relative' }}>
        <button onClick={logout} style={{ position: 'absolute', top: 0, right: 0, background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>🚪</button>
        <div style={{ width: '55px', height: '55px', backgroundColor: 'black', borderRadius: '14px', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '26px' }}>C</div>
        <h1 style={{ fontWeight: 900, fontSize: '32px', margin: 0, letterSpacing: '-1.5px' }}>{negocio?.nombre}</h1>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '10px' }}>
          <button onClick={() => router.push('/config')} style={subBtn}>⚙️ Configurar</button>
        </div>
      </header>

      {/* CAJA Y CITAS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
        <div style={cardStyle}><p style={labelS}>EN CAJA</p><p style={{ ...valS, color: '#34C759' }}>${totalCaja.toFixed(2)}</p></div>
        <div style={{ ...cardStyle, background: 'black', color: 'white' }}><p style={labelS}>CITAS</p><p style={valS}>{citas.length}</p></div>
      </div>

      {/* FORMULARIO */}
      <form onSubmit={guardar} style={formStyle}>
        <select style={inputStyle} value={form.servicio_id} onChange={e => {
          const s = servicios.find(x => x.id == e.target.value)
          setForm({...form, servicio_id: e.target.value, monto: s?.precio || ''})
        }} required>
          <option value="">Servicio</option>
          {servicios.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
        </select>
        <input style={inputStyle} placeholder="Nombre Cliente" value={form.cliente_nombre} onChange={e => setForm({...form, cliente_nombre: e.target.value})} required />
        <input style={inputStyle} placeholder="WhatsApp" value={form.whatsapp} onChange={e => setForm({...form, whatsapp: e.target.value})} required />
        <input style={inputStyle} type="number" placeholder="Monto $" value={form.monto} onChange={e => setForm({...form, monto: e.target.value})} required />
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <input type="date" style={inputStyle} value={form.fecha} onChange={e => setForm({...form, fecha: e.target.value})} required />
          <input type="time" style={inputStyle} value={form.hora} onChange={e => setForm({...form, hora: e.target.value})} required />
        </div>
        <button disabled={loading} style={buttonStyle}>{loading ? '...' : 'REGISTRAR'}</button>
      </form>

      {/* LISTA CITAS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {citas.map(c => (
          <div key={c.id} style={itemStyle}>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 800, fontSize: '15px' }}>{c.cliente_nombre}</p>
              <p style={{ margin: 0, fontSize: '11px', color: '#8E8E93' }}>
                {c.servicio_id?.nombre} • ${Number(c.monto).toFixed(2)}
              </p>
              <p style={{ margin: '2px 0', fontSize: '10px', color: '#555' }}>{formatFechaHora(c.fecha_hora)}</p>
              <p style={{ margin: 0, fontSize: '10px', fontWeight: 800, color: c.estado === 'pagado' ? '#34C759' : '#FF3B30' }}>{c.estado.toUpperCase()}</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => window.open(`https://wa.me/${c.cliente_whatsapp}?text=Hola%20${encodeURIComponent(c.cliente_nombre)}`)} style={waBtn}>💬</button>
              {c.estado === 'pendiente' && <button onClick={() => cobrar(c.id)} style={payBtn}>COBRAR</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Estilos se mantienen igual
const subBtn = { background: 'none', border: '1px solid #E5E5E7', padding: '6px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }
const cardStyle = { background: 'white', padding: '20px', borderRadius: '24px', border: '1px solid #E5E5E7', textAlign: 'center' as 'center' }
const labelS = { margin: 0, fontSize: '9px', fontWeight: 800, color: '#86868B' }
const valS = { margin: '5px 0 0', fontWeight: 900, fontSize: '22px' }
const formStyle = { background: 'white', padding: '20px', borderRadius: '24px', border: '1px solid #E5E5E7', marginBottom: '30px' }
const inputStyle = { width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '12px', border: '1px solid #D2D2D7', fontWeight: 600, fontSize: '14px', outline: 'none', boxSizing: 'border-box' as 'border-box' }
const buttonStyle = { width: '100%', padding: '14px', background: 'black', color: 'white', border: 'none', borderRadius: '14px', fontWeight: 700, cursor: 'pointer' }
const itemStyle = { background: 'white', padding: '15px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #F2F2F7' }
const waBtn = { background: '#25D366', border: 'none', width: '35px', height: '35px', borderRadius: '10px', cursor: 'pointer', fontSize: '18px', color: 'white' }
const payBtn = { background: '#FF9500', border: 'none', padding: '8px 12px', borderRadius: '10px', fontSize: '10px', fontWeight: 800, cursor: 'pointer', color: 'white' }