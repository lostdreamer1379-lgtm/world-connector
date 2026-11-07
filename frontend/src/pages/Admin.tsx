import { FormEvent, useEffect, useState } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { fetchAdminWorlds } from "../lib/api";
import { World } from "../types/world";
import WorldForm from "../components/admin/WorldForm";
import WorldList from "../components/admin/WorldList";

const supabase: SupabaseClient | null = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
  ? createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)
  : null;

export default function Admin() {
  const [session, setSession] = useState<any>(null);
  const [worlds, setWorlds] = useState<World[]>([]);
  const [editing, setEditing] = useState<World | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.access_token) return;
    fetchAdminWorlds(session.access_token).then((data) => setWorlds(data.worlds)).catch((e) => setError(e.message));
  }, [session]);

  async function login(event: FormEvent) {
    event.preventDefault();
    if (!supabase) return setError("Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY first.");
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) setError(authError.message);
  }

  if (!session) return <main className="admin-shell"><form className="admin-card max-w-md" onSubmit={login}><p className="eyebrow">WORLD CONNECTOR</p><h1>Admin access</h1><p className="muted">Sign in with the Supabase account listed in ADMIN_EMAILS.</p><input aria-label="Email" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required /><input aria-label="Password" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required /><button className="primary-button" type="submit">Sign in</button>{error && <p className="error-text">{error}</p>}<a className="muted back-link" href="/">← Return to the worlds</a></form></main>;

  async function refresh() { setWorlds((await fetchAdminWorlds(session.access_token)).worlds); }
  return <main className="admin-shell"><div className="admin-layout"><header className="admin-header"><div><p className="eyebrow">WORLD CONNECTOR / ADMIN</p><h1>Curate your worlds</h1></div><div className="admin-actions"><a className="quiet-button" href="/">View hub</a><button className="quiet-button" onClick={() => supabase?.auth.signOut()}>Sign out</button></div></header><div className="admin-grid"><WorldList worlds={worlds} token={session.access_token} onEdit={setEditing} onRefresh={refresh} /><WorldForm token={session.access_token} world={editing} onSaved={() => { setEditing(null); refresh(); }} onCancel={() => setEditing(null)} /></div>{error && <p className="error-text">{error}</p>}</div></main>;
}
