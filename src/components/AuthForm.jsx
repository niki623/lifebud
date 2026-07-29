import { useState } from 'react';
import {supabase} from '../lib/supabase.js'

export default function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSubmit(e) {
  e.preventDefault();
  setMessage('');
  const {error} = isSigningUp ? await supabase.auth.signUp({email, password,})
    : await supabase.auth.signInWithPassword({email, password,});
    /*successful sign up alerts listener in app.jsx*/

  if (error) {setMessage(error.message); return;}

  setMessage(isSigningUp? 'Account created! Check your email to confirm it.'
      : 'Logged in successfully!');
  }

  return (
    <section>
      <h2>{isSigningUp ? 'Create Account' : 'Log In'}</h2>

      <form onSubmit={handleSubmit}>
        <input type="email" value={email} placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}/>

        <input type="password" value={password} placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}/>

        <button type="submit"> {isSigningUp ? 'Sign Up' : 'Log In'} </button>
      </form>

      <button type="button" onClick={() => setIsSigningUp(current => !current)}>
        {isSigningUp ? 'Already have an account? Log in' : 'Need an account? Sign up'}
      </button>

      {message && <p>{message}</p>}
    </section>
  );
}