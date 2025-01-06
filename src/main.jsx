import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {BrowserRouter} from "react-router-dom";
import './index.css'
import './index_adaptive.css'
import App from './App.jsx'
import {DataContextProvider} from "./context/dataContext.jsx";

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <DataContextProvider>
      <App />
    </DataContextProvider>
  </BrowserRouter>
)
