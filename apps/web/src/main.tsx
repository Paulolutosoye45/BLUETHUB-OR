import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './contexts/auth-context.tsx'
// import { API } from './services/auth.ts'
// import { getSubdomain } from './utils/subdomain.ts'

// // main.tsx
// const tenantId = getSubdomain();

// if (!tenantId) {
//     // Bounce user out — redirect to your marketing/landing page
//     window.location.href = "new-bluethub-app.netlify.app"; // or wherever
// } else {
//     API.defaults.headers.common["X-Tenant-ID"] = tenantId;


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
// }
