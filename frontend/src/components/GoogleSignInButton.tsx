import { useEffect } from "react";
import { loginWithGoogle } from "../services/authApi";

declare global {
  interface Window {
    google?: { accounts: { id: { initialize: (options: { client_id: string; callback: (response: { credential: string }) => void }) => void; prompt: () => void } } };
  }
}

type Props = { onSuccess: () => void; onError: (message: string) => void };

let initializedClientId = "";
let credentialHandler: ((credential: string) => void) | null = null;
let scriptPromise: Promise<void> | null = null;

function loadGoogleScript() {
  if (window.google) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load Google sign-in."));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

function GoogleSignInButton({ onSuccess, onError }: Props) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  useEffect(() => {
    if (!clientId) return;
    credentialHandler = (credential) => void loginWithGoogle(credential).then(onSuccess).catch((error: Error) => onError(error.message));
    void loadGoogleScript().then(() => {
      if (!window.google || initializedClientId === clientId) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => credentialHandler?.(response.credential),
      });
      initializedClientId = clientId;
    }).catch((error: Error) => onError(error.message));
  }, [clientId, onError, onSuccess]);

  if (!clientId) return null;
  return (
    <button className="social-button" type="button" aria-label="Continue with Google" title="Continue with Google"
      onClick={() => window.google?.accounts.id.prompt()}>
      <img src="https://developers.google.com/identity/images/g-logo.png" alt="" width="20" height="20" />
    </button>
  );
}

export default GoogleSignInButton;
