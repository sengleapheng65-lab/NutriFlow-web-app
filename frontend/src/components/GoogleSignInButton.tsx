import { useEffect } from "react";
import { loginWithGoogleCode } from "../services/authApi";

declare global {
  interface Window {
    google?: { accounts: { oauth2: { initCodeClient: (options: { client_id: string; scope: string; ux_mode: "popup"; select_account: boolean; callback: (response: { code?: string; error?: string }) => void; error_callback: () => void }) => { requestCode: () => void } } } };
  }
}

type Props = { onSuccess: () => void; onError: (message: string) => void };

let initializedClientId = "";
let codeClient: { requestCode: () => void } | null = null;
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
    void loadGoogleScript().then(() => {
      if (!window.google || initializedClientId === clientId) return;
      codeClient = window.google.accounts.oauth2.initCodeClient({
        client_id: clientId,
        scope: "openid email profile",
        ux_mode: "popup",
        select_account: true,
        callback: (response) => {
          if (!response.code) { onError(response.error || "Google sign-in was cancelled."); return; }
          void loginWithGoogleCode(response.code).then(onSuccess).catch((error: Error) => onError(error.message));
        },
        error_callback: () => onError("Google sign-in popup could not be opened."),
      });
      initializedClientId = clientId;
    }).catch((error: Error) => onError(error.message));
  }, [clientId, onError, onSuccess]);

  if (!clientId) return null;
  return (
    <button className="social-button" type="button" aria-label="Continue with Google" title="Continue with Google"
      onClick={() => codeClient?.requestCode()}>
      <img src="https://developers.google.com/identity/images/g-logo.png" alt="" width="20" height="20" />
    </button>
  );
}

export default GoogleSignInButton;
