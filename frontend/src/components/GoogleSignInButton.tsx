import { useEffect, useRef } from "react";
import { loginWithGoogle } from "../services/authApi";

declare global {
  interface Window {
    google?: { accounts: { id: { initialize: (options: { client_id: string; callback: (response: { credential: string }) => void }) => void; prompt: () => void } } };
  }
}

type Props = { onSuccess: () => void; onError: (message: string) => void };

function GoogleSignInButton({ onSuccess, onError }: Props) {
  const containerRef = useRef<HTMLButtonElement>(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  useEffect(() => {
    if (!clientId) return;
    const render = () => {
      if (!window.google) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => void loginWithGoogle(response.credential).then(onSuccess).catch((error: Error) => onError(error.message)),
      });
    };
    if (window.google) render();
    else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.onload = render;
      document.head.appendChild(script);
    }
  }, [clientId, onError, onSuccess]);

  if (!clientId) return null;
  return (
    <button
      ref={containerRef}
      className="social-button"
      type="button"
      aria-label="Continue with Google"
      title="Continue with Google"
      onClick={() => window.google?.accounts.id.prompt()}
    >
      <img src="https://developers.google.com/identity/images/g-logo.png" alt="" width="20" height="20" />
    </button>
  );
}

export default GoogleSignInButton;
