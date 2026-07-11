import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import Landing from './screens/Landing'
import HostScreen from './screens/host/HostScreen'
import PlayScreen from './screens/play/PlayScreen'

// HashRouter — build ma działać z base './' na hostingu współdzielonym bez rewrite'ów
const router = createHashRouter([
  { path: '/', element: <Landing /> },
  { path: '/host', element: <HostScreen /> },
  { path: '/play', element: <PlayScreen /> },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
