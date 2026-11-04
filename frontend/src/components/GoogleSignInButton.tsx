import { useEffect, useRef } from "react";
import { loginWithGoogle } from "../services/authApi";

declare global {
  interface Window {
    google?: { accounts: { id: { initialize: (options: { client_id: string; callback: (response: { credential: string }) => void }) => void; renderButton: (element: HTMLElement, options: Record<string, string>) => void } } };
  }
}

type Props = { onSuccess: () => void; onError: (message: string) => void };

function GoogleSignInButton({ onSuccess, onError }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  useEffect(() => {
    if (!clientId) return;
    const render = () => {
      if (!window.google || !containerRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => void loginWithGoogle(response.credential).then(onSuccess).catch((error: Error) => onError(error.message)),
      });
      containerRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(containerRef.current, {
        theme: "outline",
        type: "icon",
        size: "large",
        shape: "square",
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
  return <div ref={containerRef} className="google-sign-in-button" aria-label="Continue with Google" />;
}

export default GoogleSignInButton;
