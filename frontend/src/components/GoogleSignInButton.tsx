import { useEffect, useRef } from "react";
import { loginWithGoogleCode } from "../services/authApi";

declare global {
  interface Window {
    google?: { accounts: { oauth2: { initCodeClient: (options: { client_id: string; scope: string; ux_mode: "popup"; select_account: boolean; callback: (response: { code?: string; error?: string }) => void; error_callback: () => void }) => { requestCode: () => void } } } };
  }
}

type Props = { onSuccess: () => void; onError: (message: string) => void; registerIntent?: boolean };

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

/** Loads Google's OAuth script and exchanges the returned authorization code with the backend. */
function GoogleSignInButton({ onSuccess, onError, registerIntent = false }: Props) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  const codeClientRef = useRef<{ requestCode: () => void } | null>(null);

  useEffect(() => {
    if (!clientId) return;
    void loadGoogleScript().then(() => {
      if (!window.google) return;
      codeClientRef.current = window.google.accounts.oauth2.initCodeClient({
        client_id: clientId,
        scope: "openid email profile",
        ux_mode: "popup",
        select_account: true,
        callback: (response) => {
          if (!response.code) { onError(response.error || "Google sign-in was cancelled."); return; }
          void loginWithGoogleCode(response.code, registerIntent).then(onSuccess).catch((error: Error) => onError(error.message));
        },
        error_callback: () => onError("Google sign-in popup could not be opened."),
      });
    }).catch((error: Error) => onError(error.message));
  }, [clientId, onError, onSuccess, registerIntent]);

  if (!clientId) return null;
  return (
    <button className="social-button" type="button" aria-label="Continue with Google" title="Continue with Google"
      onClick={() => codeClientRef.current?.requestCode()}>
      <img src="https://developers.google.com/identity/images/g-logo.png" alt="" width="20" height="20" />
    </button>
  );
}

export default GoogleSignInButton;
