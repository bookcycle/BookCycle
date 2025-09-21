export function loadGoogleScript(clientId) {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = () => {
      if (!window.google?.accounts?.id) return reject(new Error("GIS failed to load"));
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: () => {},
      });
      resolve();
    };
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

export async function renderGoogleButton(clientId, element, onCredential, options = {}) {
  await loadGoogleScript(clientId);
  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: ({ credential }) => onCredential(credential),
  });
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

export async function promptOneTap(clientId, onCredential) {
  await loadGoogleScript(clientId);
  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: ({ credential }) => onCredential(credential),
  });
  window.google.accounts.id.prompt();
}
