export function truncate64(text: string) {
  if (text.length <= 64) return text;
  return text.slice(0, 61) + '…';
}
export function fmt(dt: string | Date) {
  const d = typeof dt === 'string' ? new Date(dt) : dt;
  const pad = (n:number)=> n.toString().padStart(2,'0');
  return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
}
