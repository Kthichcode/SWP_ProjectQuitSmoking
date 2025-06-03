import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Home from './pages/Home.jsx'
import Footer from './pages/Footer';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Home />
     <Footer/> 
  </StrictMode>,
)
