import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../services/authApi";
import "../styles/Auth.css";

function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirm) { setError("Passwords do not match."); return; }
    const token = params.get("token");
    if (!token) { setError("This reset link is invalid."); return; }
    void resetPassword(token, password).then(() => navigate("/login")).catch((requestError: Error) => setError(requestError.message));
  }

  return (
    <main className="login-page"><div className="login-box"><section className="login-form">
      <div className="login-logo"><Link to="/"><img src="/NutriFlow.png" alt="NutriFlow logo" /></Link></div>
      <h1>Reset password</h1><p className="text-muted">Choose a new password with at least 8 characters.</p>
      <form onSubmit={submit}>
        <input className="form-control mb-3" type="password" placeholder="New password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required />
        <input className="form-control mb-3" type="password" placeholder="Confirm new password" minLength={8} value={confirm} onChange={(event) => setConfirm(event.target.value)} required />
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <button className="btn login-button w-100" type="submit">Reset password</button>
      </form>
    </section><aside className="login-image" /></div></main>
  );
}

export default ResetPassword;
