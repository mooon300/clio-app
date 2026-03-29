'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

// Usamos las llaves directas para conexión inmediata
const supabase = createClient(
  'https://cqlczrqyplidpxsjqqwr.supabase.co',
  'sb_publishable_0wjmKoJA2EFXZmJ7p0Vc_w_EKnJ0p9Q'
)

export default function Dashboard() {
  const router = useRouter()
  const [citas, setCitas] = useState<any[]>([])
  const [servicios, setServicios] = useState<any[]>([])
  const [negocio, setNegocio] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [nombreNuevoNegocio, setNombreNuevoNegocio] = useState('')
  const [mostrarForm, setMostrarForm] = useState(false)

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
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return router.push('/login')

    const { data: neg } = await supabase
      .from('negocios')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle()

    if (neg) {
      setNegocio(neg)
      const { data: servs } = await supabase.from('servicios').select('*').eq('negocio_id', neg.id)
      setServicios(servs || [])
      const { data: cts } = await supabase.from('citas').select('*, servicio_id(nombre)').eq('negocio_id', neg.id).order('fecha_hora', { ascending: false })
      setCitas(cts || [])
    }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  // ===== LOGOUT (Icono limpio) =====
  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // ===== GUARDAR NUEVA CITA =====
  const guardar = async (e: any) => {
    e.preventDefault()
    if (!negocio) return
    setLoading(true)
    const { error } = await supabase.from('citas').insert([{
      negocio_id: negocio.id,
      servicio_id: Number(form.servicio_id),
      cliente_nombre: form.cliente_nombre.toUpperCase(),
      cliente_whatsapp: form.whatsapp,
      monto: Number(form.monto),
      fecha_hora: `${form.fecha}T${form.hora}:00`,
      estado: 'pendiente'
    }])
    if (error) alert("Error: " + error.message)
    else { setForm({ servicio_id: '', cliente_nombre: '', monto: '', whatsapp: '', fecha: '', hora: '' }); setMostrarForm(false); fetchData(); }
    setLoading(false)
  }

  const crearNegocioInicial = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !nombreNuevoNegocio) return
    setLoading(true)
    const { error } = await supabase.from('negocios').insert([{ user_id: user.id, nombre: nombreNuevoNegocio, modo: 'citas' }])
    if (!error) fetchData()
    else { alert("Error creating business: " + error.message); setLoading(false); }
  }

  const cobrar = async (id: any) => {
    await supabase.from('citas').update({ estado: 'pagado' }).eq('id', id)
    fetchData()
  }

  const totalCaja = citas.filter(c => c.estado === 'pagado').reduce((acc, c) => acc + (Number(c.monto) || 0), 0)
  const formatFechaHora = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  // ======= PANTALLA DE CARGA PROVISIONAL =======
  if (loading && !negocio) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#FBFBFB', fontFamily: 'sans-serif' }}>
        <p style={{ fontWeight: 800, color: '#000', letterSpacing: '-1px' }}>RaRe IS LOADING...</p>
      </div>
    )
  }

  // ======= RENDER PARA USUARIOS SIN NEGOCIO (image_7.png Rediseñado) =======
  if (!negocio && !loading) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center', fontFamily: 'sans-serif', backgroundColor: '#FBFBFB', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '55px', height: '55px', backgroundColor: 'black', borderRadius: '14px', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '26px' }}>C</div>
        <h2 style={{fontWeight: 900, fontSize: '28px', letterSpacing: '-1.5px', color: '#000', margin: '0 0 10px'}}>Welcome!</h2>
        <p style={{color: '#666', marginBottom: '30px', fontSize: '16px', fontWeight: 500}}>Dinos el nombre de tu negocio para empezar:</p>
        <div style={{width: '100%', maxWidth: '350px'}}>
          <input style={{...inputStyle, border: '2px solid #EEE', textAlign: 'center', fontSize: '18px', color: '#000'}} placeholder="Ej: Barbería Morales" value={nombreNuevoNegocio} onChange={e => setNombreNuevoNegocio(e.target.value)} />
          <button onClick={crearNegocioInicial} style={{...buttonStyle, marginTop: '15px', padding: '18px', fontSize: '15px', letterSpacing: '1px'}}>CREAR MI NEGOCIO</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '30px 20px 100px', maxWidth: '480px', margin: '0 auto', backgroundColor: '#FBFBFB', minHeight: '100vh', position: 'relative' }}>
      
      {/* HEADER LIMPIO (Cambiamos el ⚙️ y 🚪 por iconos limpios) */}
      <header style={{ textAlign: 'center', marginBottom: '35px', position: 'relative' }}>
        {/* LOGOUT: Texto limpio [ < ] */}
        <button onClick={logout} style={{ position: 'absolute', top: 0, left: 0, background: 'none', border: '1px solid #EEE', padding: '6px 12px', borderRadius: '10px', fontSize: '16px', cursor: 'pointer', color: '#000', fontWeight: 800 }}>←</button>
        
        <div style={{ width: '50px', height: '50px', backgroundColor: 'black', borderRadius: '12px', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '24px' }}>C</div>
        
        <h1 style={{ fontWeight: 900, fontSize: '30px', margin: 0, letterSpacing: '-1.5px', color: '#000' }}>{negocio?.nombre}</h1>
        
        <p style={{ color: '#8E8E93', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', margin: '5px 0 15px'}}> RaRe STREETWEAR</p>
        
        {/* CONFIG: Botón limpio (Ahora sí lleva a Config) */}
        <button onClick={() => router.push('/config')} style={subBtn}>CONFIGURATION</button>
      </header>

      {/* RESUMEN DE NEGOCIO */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
        <div style={cardStyle}><p style={labelS}>EN CAJA</p><p style={{ ...valS, color: '#34C759' }}>${totalCaja.toFixed(2)}</p></div>
        <div style={{ ...cardStyle, background: 'black', color: 'white' }}><p style={labelS}>CITAS</p><p style={valS}>{citas.length}</p></div>
      </div>

      <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 15px', color: '#000'}}>Próximas Citas</h2>

      {/* LISTA CITAS (LIMPIA) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {citas.map(c => (
          <div key={c.id} style={itemStyle}>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 800, fontSize: '15px', color: '#000'}}>{c.cliente_nombre}</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#8E8E93' }}>
                {c.servicio_id?.nombre} • <span style={{fontWeight: 700, color: '#000'}}>${Number(c.monto).toFixed(2)}</span>
              </p>
              <p style={{ margin: '3px 0', fontSize: '11px', color: '#555', fontWeight: 600 }}>{formatFechaHora(c.fecha_hora)}</p>
              <p style={{ margin: 0, fontSize: '10px', fontWeight: 900, letterSpacing: '1px', color: c.estado === 'pagado' ? '#34C759' : '#FF3B30' }}>{c.estado.toUpperCase()}</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => window.open(`https://wa.me/${c.cliente_whatsapp}?text=Hola%20${encodeURIComponent(c.cliente_nombre)}`)} style={waBtn}>💬</button>
              {c.estado === 'pendiente' && <button onClick={() => cobrar(c.id)} style={payBtn}>COBRAR</button>}
            </div>
          </div>
        ))}
      </div>

      {/* BOTÓN FLOTANTE DE "+" (Icono limpio, negro sólido) */}
      <button 
        onClick={() => setMostrarForm(true)} 
        style={floatBtn}
      >+</button>

      {/* FORMULARIO MODAL (Iconos limpios y textos negros) */}
      {mostrarForm && (
        <div style={modalBg}>
          <form onSubmit={guardar} style={formStyle}>
            
            <header style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center'}}>
              <h3 style={{margin: 0, fontWeight: 900, fontSize: '22px', letterSpacing: '-1px', color: '#000'}}>Nueva Cita</h3>
              {/* CERRAR: Texto limpio [ X ] en negro */}
              <button 
                type="button" 
                onClick={() => setMostrarForm(false)} 
                style={{background: 'none', border: 'none', fontSize: '20px', color: '#000', cursor: 'pointer', fontWeight: 900 }}
              >✕</button>
            </header>

            <select style={inS} value={form.servicio_id} onChange={e => {
              const s = servicios.find(x => x.id == e.target.value)
              setForm({...form, servicio_id: e.target.value, monto: s?.precio || ''})
            }} required>
              <option value="">Servicio</option>
              {servicios.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
            <input style={inS} placeholder="Nombre Cliente" value={form.cliente_nombre} onChange={e => setForm({...form, cliente_nombre: e.target.value})} required />
            <input style={inS} placeholder="WhatsApp" value={form.whatsapp} onChange={e => setForm({...form, whatsapp: e.target.value})} required />
            <input style={inS} type="number" placeholder="Monto $" value={form.monto} onChange={e => setForm({...form, monto: e.target.value})} required />
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input type="date" style={inS} value={form.fecha} onChange={e => setForm({...form, fecha: e.target.value})} required />
              <input type="time" style={inS} value={form.hora} onChange={e => setForm({...form, hora: e.target.value})} required />
            </div>
            <button disabled={loading} style={buttonStyle}>{loading ? '...' : 'REGISTRAR'}</button>
          </form>
        </div>
      )}
    </div>
  )
}

// ====== ESTILOS REFORZADOS (Colores y formas Pro) ======
const subBtn = { background: 'none', border: '1px solid #EEE', padding: '8px 16px', borderRadius: '12px', fontSize: '11px', fontWeight: 800, cursor: 'pointer', color: '#000', letterSpacing: '1px' }
const cardStyle = { background: 'white', padding: '25px', borderRadius: '25px', border: '1px solid #EEE', textAlign: 'center' as 'center', boxShadow: '0 5px 15px rgba(0,0,0,0.02)' }
const labelS = { margin: 0, fontSize: '10px', fontWeight: 900, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '1px' }
const valS = { margin: '8px 0 0', fontWeight: 900, fontSize: '30px', color: '#000', letterSpacing: '-1px' }
const itemStyle = { background: 'white', padding: '20px', borderRadius: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #EEE', boxShadow: '0 2px 10px rgba(0,0,0,0.01)' }
const waBtn = { background: '#25D366', border: 'none', width: '38px', height: '38px', borderRadius: '12px', cursor: 'pointer', fontSize: '20px', color: 'white' }
const payBtn = { background: '#FF9500', border: 'none', padding: '10px 15px', borderRadius: '12px', fontSize: '10px', fontWeight: 900, cursor: 'pointer', color: 'white', letterSpacing: '1px' }

const floatBtn = { position: 'fixed' as 'fixed', bottom: '30px', right: '20px', width: '60px', height: '60px', backgroundColor: 'black', color: 'white', borderRadius: '50%', border: 'none', fontSize: '30px', fontWeight: 900, cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,0,0,0.3)', zIndex: 1000 }
const modalBg = { position: 'fixed' as 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }
const formStyle = { background: 'white', padding: '30px', borderRadius: '30px', width: '100%', maxWidth: '400px', boxShadow: '0 30px 60px rgba(0,0,0,0.5)' }

// Inputs con texto NEGRO INTENSO
const inS = { width: '100%', padding: '16px', marginBottom: '10px', borderRadius: '15px', border: '1px solid #EEE', fontWeight: 600, fontSize: '16px', outline: 'none', boxSizing: 'border-box' as 'border-box', color: '#000', backgroundColor: '#FFF' }
const inputStyle = { width: '100%', padding: '16px', marginBottom: '10px', borderRadius: '15px', border: '1px solid #EEE', fontWeight: 600, fontSize: '16px', outline: 'none', boxSizing: 'border-box' as 'border-box', color: '#000', backgroundColor: '#FFF' }
const buttonStyle = { width: '100%', padding: '18px', background: 'black', color: 'white', border: 'none', borderRadius: '18px', fontWeight: 800, fontSize: '14px', cursor: 'pointer' }