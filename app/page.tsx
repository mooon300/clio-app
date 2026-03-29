'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

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

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const guardarCita = async (e: any) => {
    e.preventDefault()
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
    else { 
      setForm({ servicio_id: '', cliente_nombre: '', monto: '', whatsapp: '', fecha: '', hora: '' }); 
      setMostrarForm(false);
      fetchData(); 
    }
    setLoading(false)
  }

  const crearNegocioInicial = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !nombreNuevoNegocio) return
    setLoading(true)
    const { error } = await supabase.from('negocios').insert([{ user_id: user.id, nombre: nombreNuevoNegocio, modo: 'citas' }])
    if (!error) fetchData()
    else { alert("Error: " + error.message); setLoading(false); }
  }

  const cobrarCita = async (id: any) => {
    await supabase.from('citas').update({ estado: 'pagado' }).eq('id', id)
    fetchData()
  }

  const totalCaja = citas.filter(c => c.estado === 'pagado').reduce((acc, c) => acc + (Number(c.monto) || 0), 0)
  
  const formatFechaHora = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  if (loading && !negocio) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#F0F2F5', fontFamily: 'sans-serif' }}>
        <p style={{ fontWeight: 800, color: '#000', fontSize: '18px' }}>CONECTANDO CON CLIO...</p>
      </div>
    )
  }

  if (!negocio && !loading) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', fontFamily: 'sans-serif', backgroundColor: '#F0F2F5', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#FFF', padding: '40px', borderRadius: '35px', width: '100%', maxWidth: '380px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '60px', height: '60px', backgroundColor: 'black', borderRadius: '16px', marginBottom: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '28px' }}>C</div>
          <h2 style={{ fontWeight: 900, fontSize: '28px', color: '#000', margin: '0 0 10px' }}>¡Bienvenido!</h2>
          <p style={{ color: '#666', marginBottom: '35px', fontSize: '15px' }}>Dinos el nombre de tu negocio:</p>
          <input style={inS} placeholder="Ej: Barbería Morales" value={nombreNuevoNegocio} onChange={e => setNombreNuevoNegocio(e.target.value)} />
          <button onClick={crearNegocioInicial} style={buttonStyle}>CREAR MI NEGOCIO</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '30px 20px 100px', maxWidth: '480px', margin: '0 auto', backgroundColor: '#FBFBFB', minHeight: '100vh', position: 'relative' }}>
      <header style={{ textAlign: 'center', marginBottom: '35px', position: 'relative' }}>
        <button onClick={logout} style={{ position: 'absolute', top: 0, right: 0, background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>🚪</button>
        <div style={{ width: '50px', height: '50px', backgroundColor: 'black', borderRadius: '12px', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '24px' }}>C</div>
        <h1 style={{ fontWeight: 900, fontSize: '28px', margin: 0, color: '#000' }}>{negocio?.nombre}</h1>
        <button onClick={() => router.push('/config')} style={subBtn}>⚙️ CONFIGURACIÓN</button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
        <div style={cardStyle}><p style={labelS}>Citas Hoy</p><p style={valS}>{citas.length}</p></div>
        <div style={cardStyle}><p style={labelS}>Caja Semanal</p><p style={{ ...valS, color: '#34C759' }}>${totalCaja.toFixed(2)}</p></div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {citas.map(c => (
          <div key={c.id} style={itemStyle}>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 800 }}>{c.cliente_nombre}</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#8E8E93' }}>{c.servicio_id?.nombre} • ${Number(c.monto).toFixed(2)}</p>
              <p style={{ margin: '3px 0', fontSize: '11px', color: '#555' }}>{formatFechaHora(c.fecha_hora)}</p>
              <p style={{ margin: 0, fontSize: '10px', fontWeight: 900, color: c.estado === 'pagado' ? '#34C759' : '#FF3B30' }}>{c.estado.toUpperCase()}</p>
            </div>
            <button onClick={() => window.open(`https://wa.me/${c.cliente_whatsapp}`)} style={waBtn}>💬</button>
            {c.estado === 'pendiente' && <button onClick={() => cobrarCita(c.id)} style={payBtn}>COBRAR</button>}
          </div>
        ))}
      </div>

      <button onClick={() => setMostrarForm(true)} style={floatBtn}>+</button>

      {mostrarForm && (
        <div style={modalBg}>
          <form onSubmit={guardarCita} style={formStyle}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px'}}>
              <h3 style={{margin:0}}>Nueva Cita</h3>
              <button type="button" onClick={()=>setMostrarForm(false)}>✖️</button>
            </div>
            <select style={inS} value={form.servicio_id} onChange={e => {
              const s = servicios.find(x => x.id == e.target.value)
              setForm({...form, servicio_id: e.target.value, monto: s?.precio || ''})
            }} required>
              <option value="">Servicio</option>
              {servicios.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
            <input style={inS} placeholder="Cliente" value={form.cliente_nombre} onChange={e => setForm({...form, cliente_nombre: e.target.value})} required />
            <input style={inS} placeholder="WhatsApp" value={form.whatsapp} onChange={e => setForm({...form, whatsapp: e.target.value})} required />
            <input style={inS} type="number" placeholder="Monto $" value={form.monto} onChange={e => setForm({...form, monto: e.target.value})} required />
            <div style={{display:'flex', gap:'10px'}}>
              <input type="date" style={inS} value={form.fecha} onChange={e => setForm({...form, fecha: e.target.value})} required />
              <input type="time" style={inS} value={form.hora} onChange={e => setForm({...form, hora: e.target.value})} required />
            </div>
            <button style={buttonStyle}>REGISTRAR</button>
          </form>
        </div>
      )}
    </div>
  )
}

// ESTILOS (Asegúrate de que TODOS estén aquí abajo)
const subBtn = { background:'none', border:'1px solid #EEE', padding:'8px', borderRadius:'10px', fontSize:'11px', fontWeight:800, cursor:'pointer' }
const cardStyle = { background:'white', padding:'20px', borderRadius:'20px', border:'1px solid #EEE', textAlign:'center' as 'center' }
const labelS = { margin:0, fontSize:'10px', fontWeight:900, color:'#8E8E93' }
const valS = { margin:'5px 0 0', fontWeight:900, fontSize:'24px', color:'#000' }
const itemStyle = { background:'white', padding:'15px', borderRadius:'20px', display:'flex', alignItems:'center', border:'1px solid #EEE', gap:'10px' }
const waBtn = { background:'#25D366', border:'none', width:'35px', height:'35px', borderRadius:'10px', color:'white', fontSize:'18px' }
const payBtn = { background:'#FF9500', border:'none', padding:'8px', borderRadius:'10px', color:'white', fontSize:'10px', fontWeight:900 }
const floatBtn = { position:'fixed' as 'fixed', bottom:'30px', right:'20px', width:'60px', height:'60px', backgroundColor:'black', color:'white', borderRadius:'50%', border:'none', fontSize:'30px', fontWeight:900, boxShadow:'0 10px 20px rgba(0,0,0,0.3)' }
const modalBg = { position:'fixed' as 'fixed', top:0, left:0, width:'100%', height:'100%', backgroundColor:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000, padding:'20px' }
const formStyle = { background:'white', padding:'30px', borderRadius:'30px', width:'100%', maxWidth:'400px' }
const inS = { width:'100%', padding:'12px', marginBottom:'10px', borderRadius:'12px', border:'1px solid #EEE', fontWeight:600, fontSize:'14px', color:'#000', backgroundColor: '#FFF' }
const buttonStyle = { width:'100%', padding:'15px', background:'black', color:'white', border:'none', borderRadius:'15px', fontWeight:800 }