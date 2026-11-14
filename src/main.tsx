import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/nunito'
import './index.css'
import App from './App.tsx'
import { loadDecks } from './decks'
import { applyPrefs } from './prefs'

applyPrefs()

await loadDecks()
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
