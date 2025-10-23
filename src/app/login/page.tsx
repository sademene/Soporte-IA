'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage(){
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent){
    e.preventDefault();
    setError(null);
    const r = await fetch('/api/auth/login', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ username, password })
    });
    if (!r.ok){
      const j = await r.json().catch(()=>({error:'Error'}));
      setError(j.error || 'Error');
      return;
    }
    router.push('/chat');
  }

  return (
    <div className="container">
      <div className="card" style={{maxWidth:420, margin:'6rem auto'}}>
        <div className="row" style={{justifyContent:'space-between'}}>
          <h2 style={{margin:0}}>Chat de Soporte IA</h2>
          <span className="badge mono">v1.0</span>
        </div>
        <form onSubmit={onSubmit} className="row" style={{flexDirection:'column', gap:'1rem', marginTop:'1rem'}}>
          <input autoFocus placeholder="Usuario" value={username} onChange={e=>setUsername(e.target.value)} />
          <input placeholder="Contraseña" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          {error && <div className="badge" role="alert">{error}</div>}
          <button className="button" type="submit">Entrar</button>
        </form>
        <hr/>
        <div className="mono" style={{fontSize:12, color:'var(--muted)'}}>
          Superadmin desde .env — usuario: <b>{process.env.NEXT_PUBLIC_DUMMY || 'admin'}</b>
        </div>
      </div>
    </div>
  );
}
