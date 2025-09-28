const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!GOOGLE_CLIENT_ID) {

  console.error("VITE_GOOGLE_CLIENT_ID is missing");
}

let gisLoaded = false;
let initialized = false;

export function loadGoogleScript() {
  return new Promise((resolve, reject) => {
    if (gisLoaded || window.google?.accounts?.id) {
      gisLoaded = true;
      return resolve();
    }
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = () => { gisLoaded = true; resolve(); };
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

function ensureInitialized(onCredential) {
  if (!window.google?.accounts?.id) throw new Error("Google Identity Services not loaded");
  window.google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: ({ credential }) => onCredential?.(credential),
  });
  initialized = true;
}


export async function renderGoogleButton(element, onCredential, options = {}) {
  await loadGoogleScript();
  if (!initialized) ensureInitialized(onCredential);
  else if (onCredential) {
    // refresh callback while keeping the same client id
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: ({ credential }) => onCredential(credential),
    });
  }
  window.google.accounts.id.renderButton(element, {
    width: 380,
    size: "large",
    theme: "outline",
    type: "standard",
    logo_alignment: "center",
    shape: "rectangular",
    ...options,
  });
}


export async function promptOneTap(onCredential) {
  await loadGoogleScript();
  if (!initialized) ensureInitialized(onCredential);
  else if (onCredential) {
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: ({ credential }) => onCredential(credential),
    });
  }
  window.google.accounts.id.prompt();
}

export function getGoogleClientId() {
  return GOOGLE_CLIENT_ID;
}
