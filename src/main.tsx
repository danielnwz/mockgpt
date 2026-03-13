import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App.tsx'

const params = new URLSearchParams(window.location.search);
const redirectedPath = params.get('p');
if (redirectedPath) {
  window.history.replaceState(null, '', redirectedPath);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
