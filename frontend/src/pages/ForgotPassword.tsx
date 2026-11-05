import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../services/authApi";
import "../styles/Auth.css";

/** Lets a visitor request a password-reset link without revealing account existence. */
function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    void requestPasswordReset(email)
      .then(() => setMessage("If an account exists for that email, a reset link has been sent."))
      .catch((requestError: Error) => setError(requestError.message));
  }

  return (
    <main className="login-page"><div className="login-box"><section className="login-form">
      <div className="login-logo"><Link to="/"><img src="/NutriFlow.png" alt="NutriFlow logo" /></Link></div>
      <h1>Forgot password?</h1><p className="text-muted">Enter your email and we&apos;ll send you a reset link.</p>
      <form onSubmit={submit}>
        <label className="form-label" htmlFor="resetEmail">Email</label>
        <input className="form-control mb-3" id="resetEmail" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        {message && <div className="alert alert-success py-2">{message}</div>}
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <button className="btn login-button w-100" type="submit">Send reset link</button>
      </form>
      <p className="text-center text-muted mt-4"><Link to="/login">Back to sign in</Link></p>
    </section><aside className="login-image" /></div></main>
  );
}

export default ForgotPassword;
