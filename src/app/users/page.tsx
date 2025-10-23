'use client';
import { useEffect, useState } from 'react';

type Row = { id:number; username:string; role:'user'|'admin'; blocked:number; valid_until?:string };

export default function UsersPage(){
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ username:'', password:'', role:'user', valid_until:'' });

  async function refresh(){
    setError(null);
    const r = await fetch('/api/users', { cache:'no-store' });
    if (!r.ok){ setError('Sin permisos o sesión'); return; }
    const j = await r.json();
    setRows(j.users||[]);
  }
  useEffect(()=>{ refresh(); },[]);

  async function createUser(){
    const r = await fetch('/api/users', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) });
    if (!r.ok){ const j=await r.json().catch(()=>({error:'Error'})); setError(j.error||'Error'); return; }
    setForm({ username:'', password:'', role:'user', valid_until:'' });
    refresh();
  }

  async function block(id:number, blocked:boolean){
    await fetch(`/api/users/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ blocked }) });
    refresh();
  }
  async function remove(id:number){
    if (!confirm('¿Eliminar usuario?')) return;
    await fetch(`/api/users/${id}`, { method:'DELETE' });
    refresh();
  }

  return (
    <div className="container">
      <div className="row" style={{justifyContent:'space-between'}}>
        <h2>Usuarios</h2>
        <a className="button secondary" href="/chat">Volver</a>
      </div>
      {error && <div className="badge" role="alert">{error}</div>}
      <div className="card" style={{marginTop:'1rem'}}>
        <div className="row" style={{gap:'.5rem', flexWrap:'wrap'}}>
          <input placeholder="Usuario" value={form.username} onChange={e=>setForm({...form, username:e.target.value})}/>
          <input placeholder="Contraseña" value={form.password} onChange={e=>setForm({...form, password:e.target.value})}/>
          <select value={form.role} onChange={e=>setForm({...form, role:e.target.value})}>
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
          <input type="datetime-local" value={form.valid_until} onChange={e=>setForm({...form, valid_until:e.target.value})}/>
          <button className="button" onClick={createUser}>Crear</button>
        </div>
      </div>
      <div className="card" style={{marginTop:'1rem'}}>
        {rows.map(r=>(
          <div key={r.id} className="row" style={{justifyContent:'space-between', padding:'.5rem 0', borderBottom:'1px solid #2b3240'}}>
            <div>
              <div className="title">{r.username}</div>
              <div className="mono" style={{fontSize:12, color:'var(--muted)'}}>rol: {r.role} · id: {r.id} · vence: {r.valid_until||'—'}</div>
            </div>
            <div className="row" style={{gap:'.5rem'}}>
              <button className="button secondary" onClick={()=>block(r.id, !r.blocked)}>{r.blocked?'Desbloquear':'Bloquear'}</button>
              <button className="button secondary" onClick={()=>remove(r.id)}>Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
