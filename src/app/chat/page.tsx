'use client';
import { v4 as uuidv4 } from 'uuid';
import { useEffect, useMemo, useRef, useState } from 'react';

type Msg = { role: 'user' | 'assistant'; content: string; sources?: string[] };
type Conv = { id: string; title: string; messages: Msg[]; archived: boolean; createdAt: number };

function ns(username: string){ return `soporte-ia:${username}:conversations`; }

export default function ChatPage(){
  const [username, setUsername] = useState<string>('usuario');
  const [convs, setConvs] = useState<Conv[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(()=>{
    (async ()=>{
      const me = await fetch('/api/auth/me').then(r=>r.json()).catch(()=>({user:null}));
      const u = me.user?.username || 'usuario';
      setUsername(u);
      const raw = localStorage.getItem(ns(u));
      if (raw){
        const list: Conv[] = JSON.parse(raw);
        setConvs(list);
        const current = list.find(c=>!c.archived) || createNew(list, u);
        setActiveId(current.id);
      }else{
        const list = [baseConv()];
        localStorage.setItem(ns(u), JSON.stringify(list));
        setConvs(list);
        setActiveId(list[0].id);
      }
    })();
  },[]);

  function baseConv(): Conv{
    return { id: uuidv4(), title: 'Nueva conversación', messages: [], archived: false, createdAt: Date.now() };
  }

  function save(list: Conv[]){
    setConvs(list);
    localStorage.setItem(ns(username), JSON.stringify(list));
  }

  function createNew(list?: Conv[], u?: string){
    const l = list || convs;
    const fresh = baseConv();
    const upd = l.map(c => ({...c, archived: c.messages.length ? true : c.archived }));
    const final = [...upd, fresh];
    localStorage.setItem(ns(u || username), JSON.stringify(final));
    setConvs(final);
    return fresh;
  }

  async function send(){
    if (!input.trim() || sending) return;
    setSending(true);
    const msg: Msg = { role:'user', content: input.trim() };
    const list = convs.map(c => c.id === activeId ? ({...c, messages:[...c.messages, msg]}) : c);
    // Auto-rename title
    const title = input.trim().slice(0,64) + (input.trim().length>64 ? '…' : '');
    const titled = list.map(c => c.id === activeId && c.messages.length===0 ? ({...c, title}) : c);
    save(titled);
    setInput('');

    const session_id = activeId;
    const r = await fetch('/api/proxy/query', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ session_id, question: msg.content })
    });
    const j = await r.json().catch(()=>({answer:'(Mock) Error de conexión.', sources:[] as string[]}));
    const assistant: Msg = { role:'assistant', content: j.answer || '(Mock) sin respuesta', sources: j.sources || [] };
    const list2 = convs.map(c => c.id === activeId ? c : c); // ensure closure correct
    const updated = (list2.length ? list2 : titled).map(c => c.id === activeId ? ({...c, messages:[...((titled.find(x=>x.id===c.id)||c).messages), assistant]}) : c);
    save(updated);
    setSending(false);
  }

  function newConversation(){
    const current = convs.find(c=>c.id===activeId);
    if (current && current.messages.length === 0) {
      // si no hay mensajes, no archivar
      const fresh = createNew();
      setActiveId(fresh.id);
      return;
    }
    const upd = convs.map(c => c.id === activeId ? ({...c, archived: c.messages.length>0}) : c);
    save(upd);
    const fresh = createNew();
    setActiveId(fresh.id);
  }

  function clearHistory(){
    if (!confirm('¿Borrar conversaciones archivadas?')) return;
    const keep = convs.filter(c => !c.archived);
    save(keep);
  }

  function exportTxt(c: Conv){
    const dt = new Date(c.createdAt);
    const pad = (n:number)=>String(n).padStart(2,'0');
    const slug = c.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,32) || 'chat';
    const stamp = `${dt.getFullYear()}${pad(dt.getMonth()+1)}${pad(dt.getDate())}-${pad(dt.getHours())}${pad(dt.getMinutes())}`;
    const lines = [
      `Soporte-IA_${username}_${stamp}_${slug}.txt`,
      '',
      ...c.messages.flatMap(m => {
        const role = m.role === 'user' ? '[Usuario]' : '[Asistente]';
        const arr = [`${role} ${m.content}`];
        if (m.role === 'assistant' && m.sources?.length) arr.push(`Fuentes: ${m.sources.join(', ')}`);
        return arr;
      })
    ];
    const blob = new Blob([lines.join('\n')], { type:'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = lines[0];
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const active = useMemo(()=>convs.find(c=>c.id===activeId) || null, [convs, activeId]);

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="row" style={{justifyContent:'space-between'}}>
          <div className="title">Conversaciones</div>
          <button className="button secondary" onClick={newConversation}>Nueva</button>
        </div>
        <div className="list" style={{marginTop:'1rem'}}>
          {convs.filter(c=>c.archived).map(c=>(
            <div key={c.id} className="card">
              <div className="title">{c.title}</div>
              <div className="row" style={{justifyContent:'space-between', marginTop:'.5rem'}}>
                <span className="badge">Historial</span>
                <button className="button secondary" onClick={()=>exportTxt(c)}>Exportar</button>
              </div>
            </div>
          ))}
        </div>
        <hr/>
        <button className="button secondary" onClick={clearHistory}>Borrar historial</button>
      </aside>
      <main className="main">
        <div className="row" style={{justifyContent:'space-between'}}>
          <h2 style={{margin:0}}>{active?.title || 'Chat'}</h2>
          <div className="row" style={{gap:'.5rem'}}>
            <a className="button secondary" href="/settings">Configuración</a>
            <a className="button secondary" href="/users">Usuarios</a>
            <form action="/api/auth/logout" method="post"><button className="button">Logout</button></form>
          </div>
        </div>
        <div style={{marginTop:'1rem'}}>
          {(active?.messages||[]).map((m,i)=>(
            <div key={i} className={"chat-bubble " + (m.role==='assistant'?'assistant':'')}>
              <div style={{whiteSpace:'pre-wrap'}}>{m.content}</div>
              {m.role==='assistant' && m.sources?.length ? (
                <div className="mono" style={{fontSize:12, marginTop:'.5rem', color:'var(--muted)'}}>Fuentes: {m.sources.join(', ')}</div>
              ) : null}
            </div>
          ))}
        </div>
        <div className="chat-footer">
          <input
            className="chat-input"
            placeholder="Escribe tu pregunta… (Enter envía)"
            value={input}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{ if (e.key==='Enter' && !e.shiftKey){ e.preventDefault(); send(); } }}
          />
          <button disabled={sending} className="button" onClick={send}>{sending?'Enviando…':'Enviar'}</button>
        </div>
      </main>
    </div>
  );
}
