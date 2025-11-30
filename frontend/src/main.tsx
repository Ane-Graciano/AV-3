import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './pages/App.tsx'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import CadFunc from './pages/cadFunc.tsx'
import CadEtapa from './pages/cadEtapa.tsx'
import VisFunc from './pages/visFunc.tsx'
import VisPeca from './pages/visPeca.tsx'
import VisTeste from './pages/visTeste.tsx'
import VisEtapa from './pages/visEtapa.tsx'
import VisAeronave from './pages/visAeronave.tsx'
import Login from './pages/Login.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path='/home' element={<App/>}/>
        <Route path='/funcs' element={<VisFunc/>}/>
        <Route path='/pecas' element={<VisPeca/>}/>
        <Route path='/testes' element={<VisTeste/>}/>
        <Route path='/etapas' element={<VisEtapa/>}/>
        <Route path='/aeronaves' element={<VisAeronave/>}/>
        <Route path='/' element={<Login/>}/>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
