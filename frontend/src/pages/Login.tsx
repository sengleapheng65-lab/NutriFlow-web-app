import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { login } from "../services/authApi";
import "../styles/Auth.css";

function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    void login(email, password)
      .then(() => {
        // Reload App so its initial /auth/me check picks up the new session.
        window.location.assign((location.state as { from?: string } | null)?.from || "/dashboard");
      })
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setIsSubmitting(false));
  }

  return (
    <main className="login-page">
      <div className="login-box">
        <section className="login-form">
          <div className="login-logo">
            <Link to="/">
              <img src="/NutriFlow.png" alt="NutriFlow logo" />
            </Link>
          </div>

          <h1>Welcome back!</h1>
          <p className="text-muted">
            Let&apos;s continue your healthy journey.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label" htmlFor="email">
                Email
              </label>

              <input
                className="form-control"
                id="email"
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="mb-2">
              <label className="form-label" htmlFor="password">
                Password
              </label>

              <div className="input-group">
                <input
                  className="form-control"
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />

                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <i
                    className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"}
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>

            <div className="text-end mb-4">
              <button className="btn btn-link forgot-link p-0" type="button">
                Forgot password?
              </button>
            </div>

            {error && <div className="alert alert-danger py-2">{error}</div>}
            <button className="btn login-button w-100" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Signing in…" : "Sign In"}
            </button>

            <div className="divider my-4">
              <span>Or continue with</span>
            </div>

            <div className="social-buttons">
              <button
                className="social-button"
                type="button"
                aria-label="Continue with Google"
                title="Continue with Google"
              >
                <img
                  src="https://developers.google.com/identity/images/g-logo.png"
                  alt=""
                  width="20"
                  height="20"
                />
              </button>

              <button
                className="social-button facebook-button"
                type="button"
                aria-label="Continue with Facebook"
                title="Continue with Facebook"
              >
                <i className="bi bi-facebook" aria-hidden="true" />
              </button>
            </div>

            <p className="text-center text-muted mt-4 mb-0">
              Don&apos;t have an account?{" "}
              <button
                className="btn btn-link p-0 mb-1"
                type="button"
                onClick={() => navigate("/register")}
              >
                Create account
              </button>
            </p>
          </form>
        </section>

        <aside className="login-image">
          <div className="image-text">
            <h2>Healthy choices, made simple.</h2>
            <p>Track meals and understand what you eat.</p>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default Login;
