'use client';
import { useEffect, useState } from 'react';

export default function SettingsPage(){
  const [brand, setBrand] = useState('#7c3aed');
  const [theme, setTheme] = useState<'dark'|'light'>('dark');
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  useEffect(()=>{
    (async ()=>{
      const cfg = await fetch('/api/settings', { cache:'no-store' }).then(r=>r.json()).catch(()=>({brand_hex:'#7c3aed', theme:'dark'}));
      setBrand(cfg.brand_hex || '#7c3aed');
      setTheme(cfg.theme || 'dark');
      // aplicar instantáneo
      document.documentElement.setAttribute('data-theme', cfg.theme || 'dark');
      document.documentElement.style.setProperty('--brand', cfg.brand_hex || '#7c3aed');
      // persistir local
      document.cookie = `soporte-ia-theme=${cfg.theme}; Path=/`;
      document.cookie = `soporte-ia-brand=${cfg.brand_hex}; Path=/`;
    })();
  },[]);

  async function save(){
    setError(null); setOk(null);
    const r = await fetch('/api/settings', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ brand_hex: brand, theme })});
    if (!r.ok){
      const j = await r.json().catch(()=>({error:'Error'}));
      setError(j.error || 'Error al guardar (¿permisos?)');
      return;
    }
    setOk('Guardado');
  }

  return (
    <div className="container">
      <div className="row" style={{justifyContent:'space-between'}}>
        <h2>Configuración</h2>
        <a className="button secondary" href="/chat">Volver</a>
      </div>
      <div className="card" style={{maxWidth:680}}>
        <div className="row" style={{gap:'1rem'}}>
          <label style={{width:160}}>Tema</label>
          <select value={theme} onChange={e=>{ const t=e.target.value as 'dark'|'light'; setTheme(t); document.documentElement.setAttribute('data-theme', t); document.cookie=`soporte-ia-theme=${t}; Path=/`; }}>
            <option value="dark">Oscuro</option>
            <option value="light">Claro</option>
          </select>
        </div>
        <div className="row" style={{gap:'1rem', marginTop:'1rem'}}>
          <label style={{width:160}}>Color de marca</label>
          <input type="color" value={brand} onChange={e=>{ setBrand(e.target.value); document.documentElement.style.setProperty('--brand', e.target.value); document.cookie=`soporte-ia-brand=${e.target.value}; Path=/`; }} />
        </div>
        <div className="row" style={{gap:'1rem', marginTop:'1rem'}}>
          <button className="button" onClick={save}>Guardar</button>
          {ok && <span className="badge" role="status">{ok}</span>}
          {error && <span className="badge" role="alert">{error}</span>}
        </div>
      </div>
    </div>
  );
}
