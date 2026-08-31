import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Auth.css";

function Register() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setPasswordError("");

    // Temporary until Spring Boot registration is connected.
    navigate("/login");
  }

  return (
    <main className="login-page">
      <div className="login-box register-box">
        <section className="login-form">
          <div className="login-logo">
            <Link to="/">
              <img src="/NutriFlow.png" alt="NutriFlow logo" />
            </Link>
          </div>

          <h1>Create account</h1>
          <p className="text-muted">Start tracking your nutrition today.</p>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label" htmlFor="name">
                Full name
              </label>

              <input
                className="form-control"
                id="name"
                type="text"
                placeholder="Your name"
                autoComplete="name"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="registerEmail">
                Email
              </label>

              <input
                className="form-control"
                id="registerEmail"
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="registerPassword">
                Password
              </label>

              <div className="input-group">
                <input
                  className={`form-control ${
                    passwordError ? "is-invalid" : ""
                  }`}
                  id="registerPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setPasswordError("");
                  }}
                  minLength={8}
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

            <div className="mb-4">
              <label className="form-label" htmlFor="confirmPassword">
                Confirm password
              </label>

              <div className="input-group">
                <input
                  className={`form-control ${
                    passwordError ? "is-invalid" : ""
                  }`}
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Enter password again"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    setPasswordError("");
                  }}
                  minLength={8}
                  required
                />

                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => setShowConfirmPassword((current) => !current)}
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirmation password"
                      : "Show confirmation password"
                  }
                >
                  <i
                    className={
                      showConfirmPassword ? "bi bi-eye-slash" : "bi bi-eye"
                    }
                    aria-hidden="true"
                  />
                </button>
              </div>

              {passwordError && (
                <div className="text-danger mt-1">{passwordError}</div>
              )}
            </div>

            <button className="btn login-button w-100" type="submit">
              Create Account
            </button>

            <p className="text-center text-muted mt-4">
              Already have an account?{" "}
              <button
                className="btn btn-link p-0 mb-1"
                type="button"
                onClick={() => navigate("/login")}
              >
                Sign in
              </button>
            </p>
          </form>
        </section>

        <aside className="login-image">
          <div className="image-text">
            <h2>Build healthier habits.</h2>
            <p>Small improvements can create meaningful results.</p>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default Register;
