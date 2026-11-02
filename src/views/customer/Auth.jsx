import { useState } from 'react';
import { ArrowRight, KeyRound, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { useUser } from '../../context/UserContext.jsx';

const Auth = ({ onSuccess }) => {
  const { login, register } = useUser();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const user = mode === 'login'
        ? await login({ email, password })
        : await register({ name, email, password });
      onSuccess(user);
    } catch (requestError) {
      setError(requestError.message || 'We could not complete sign in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-visual">
        <img src="/images/room_ocean.jpg" alt="Mediterranean coast near Royal Talassa" />
        <div className="auth-visual-shade" />
        <div className="auth-visual-copy">
          <span>YOUR TALASSA JOURNEY</span>
          <h1>Come back to<br /><em>the feeling.</em></h1>
          <p>Save your plans, manage your reservations, and let us make your stay feel effortless.</p>
        </div>
      </div>
      <div className="auth-panel">
        <div className="auth-form-wrap">
          <div className="auth-mark"><ShieldCheck size={18} /> PRIVATE GUEST PORTAL</div>
          <h2>{mode === 'login' ? 'Welcome back' : 'Create your guest account'}</h2>
          <p className="auth-intro">{mode === 'login' ? 'Sign in to manage your Royal Talassa stay.' : 'A few details, then your escape is closer.'}</p>

          <div className="auth-tabs" role="tablist" aria-label="Account access">
            <button type="button" className={mode === 'login' ? 'selected' : ''} onClick={() => { setMode('login'); setError(''); }}>Sign in</button>
            <button type="button" className={mode === 'register' ? 'selected' : ''} onClick={() => { setMode('register'); setError(''); }}>Create account</button>
          </div>

          <form onSubmit={submit} className="auth-form">
            {mode === 'register' && (
              <label>
                <span>Your name</span>
                <div className="auth-input"><UserRound size={16} /><input autoComplete="name" required minLength="2" maxLength="100" value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" /></div>
              </label>
            )}
            <label>
              <span>Email address</span>
              <div className="auth-input"><Mail size={16} /><input type="email" autoComplete="email" required maxLength="254" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></div>
            </label>
            <label>
              <span>Password</span>
              <div className="auth-input"><KeyRound size={16} /><input type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required minLength={mode === 'login' ? 1 : 10} maxLength="72" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={mode === 'login' ? 'Your password' : 'At least 10 characters'} /></div>
              {mode === 'register' && <small>Use 10 or more characters.</small>}
            </label>
            {error && <div className="auth-error" role="alert">{error}</div>}
            <button type="submit" disabled={submitting} className="auth-submit">
              {submitting ? 'Please wait…' : mode === 'login' ? 'Sign in to your account' : 'Create guest account'} <ArrowRight size={16} />
            </button>
          </form>
          <p className="auth-footnote">Administrator access is provisioned by the hotel. Guest registration never creates an administrator account.</p>
        </div>
      </div>
    </main>
  );
};

export default Auth;
