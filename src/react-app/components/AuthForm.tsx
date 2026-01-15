import React, { useState } from 'react';
import { signIn, signUp, signOut, getCurrentUser } from '../hooks/useSupabaseAuth';

export default function AuthForm() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<any>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (mode === 'login') {
      const res = await signIn(email, password);
      if (res.error) setMessage('Error: ' + res.error.message);
      else {
        const userData = await getCurrentUser();
        setUser(userData.data.user);
        setMessage('¡Login exitoso!');
      }
    } else {
      const res = await signUp(email, password);
      if (res.error) setMessage('Error: ' + res.error.message);
      else setMessage('¡Registrado! Revisa tu correo.');
    }
  }

  async function handleSignOut() {
    await signOut();
    setUser(null);
    setMessage('Sesión cerrada');
  }

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: 16 }}>
      <h2>{mode === 'login' ? 'Ingresar' : 'Registrarse'}</h2>
      <form onSubmit={handleSubmit}>
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" required />
        <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña" type="password" required />
        <button type="submit">{mode === 'login' ? 'Iniciar sesión' : 'Registrarse'}</button>
      </form>
      <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')} style={{ marginTop: 8 }}>
        {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Ingresar'}
      </button>
      {message && <div style={{ color: message.startsWith('Error') ? 'red' : 'green', marginTop: 12 }}>{message}</div>}
      {user && (
        <div style={{ marginTop: 16 }}>
          <strong>Sesión activa:</strong> {user.email}
          <br />
          <button onClick={handleSignOut} style={{ marginTop: 8 }}>Cerrar sesión</button>
        </div>
      )}
    </div>
  );
}
