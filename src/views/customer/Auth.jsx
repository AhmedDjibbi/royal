import { useState } from 'react';
import { ArrowRight, DoorOpen, KeyRound, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { useUser } from '../../context/UserContext.jsx';

const Auth = ({ onSuccess }) => {
  const { login, guestAccess } = useUser();
  const [mode, setMode] = useState('guest');
  const [username, setUsername] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError('');
  };

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const user = mode === 'guest'
        ? await guestAccess({ username, roomNumber: Number(roomNumber) })
        : await login({ email, password });
      onSuccess(user);
    } catch (requestError) {
      setError(requestError.message || 'We could not open your guest account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-visual">
        <img src="/images/room_ocean.jpg" alt="Royal Talassa suite with a Mediterranean sea view" />
        <div className="auth-visual-shade" />
        <div className="auth-visual-copy">
          <span>YOUR TALASSA JOURNEY</span>
          <h1>Your stay,<br /><em>at your fingertips.</em></h1>
          <p>Enter with the name and room number from your reservation. Your guest account is created the first time you sign in.</p>
        </div>
      </div>
      <div className="auth-panel">
        <div className="auth-form-wrap">
          <div className="auth-mark"><ShieldCheck size={18} /> PRIVATE GUEST PORTAL</div>
          <h2>{mode === 'guest' ? 'Welcome to Royal Talassa' : 'Staff access'}</h2>
          <p className="auth-intro">
            {mode === 'guest'
              ? 'No password needed. Use your name and your room number from 101 to 483.'
              : 'Hotel administrators sign in with their provisioned email and password.'}
          </p>

          <form onSubmit={submit} className="auth-form">
            {mode === 'guest' ? (
              <>
                <label>
                  <span>Your name</span>
                  <div className="auth-input">
                    <UserRound size={16} />
                    <input
                      autoComplete="username"
                      required
                      minLength="2"
                      maxLength="100"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      placeholder="Name used for your reservation"
                    />
                  </div>
                </label>
                <label>
                  <span>Room number</span>
                  <div className="auth-input">
                    <DoorOpen size={16} />
                    <input
                      type="number"
                      inputMode="numeric"
                      autoComplete="off"
                      required
                      min="101"
                      max="483"
                      step="1"
                      value={roomNumber}
                      onChange={(event) => setRoomNumber(event.target.value)}
                      placeholder="Between 101 and 483"
                    />
                  </div>
                  <small>Your chamber number, from 101 to 483. An account is created automatically.</small>
                </label>
              </>
            ) : (
              <>
                <label>
                  <span>Work email</span>
                  <div className="auth-input">
                    <Mail size={16} />
                    <input type="email" autoComplete="email" required maxLength="254" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@royaltalassa.com" />
                  </div>
                </label>
                <label>
                  <span>Password</span>
                  <div className="auth-input">
                    <KeyRound size={16} />
                    <input type="password" autoComplete="current-password" required maxLength="72" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Your password" />
                  </div>
                </label>
              </>
            )}

            {error && <div className="auth-error" role="alert">{error}</div>}

            <button type="submit" disabled={submitting} className="auth-submit">
              {submitting ? 'Please wait…' : mode === 'guest' ? 'Enter your stay' : 'Sign in to the console'} <ArrowRight size={16} />
            </button>
          </form>

          <p className="auth-footnote">
            {mode === 'guest' ? (
              <>
                Your guest account is created automatically from your name and room number.{' '}
                <button type="button" className="auth-mode-link" onClick={() => switchMode('staff')}>Hotel staff sign-in</button>
              </>
            ) : (
              <>
                Administrator access is provisioned by the hotel.{' '}
                <button type="button" className="auth-mode-link" onClick={() => switchMode('guest')}>Back to guest sign-in</button>
              </>
            )}
          </p>
        </div>
      </div>
    </main>
  );
};

export default Auth;
