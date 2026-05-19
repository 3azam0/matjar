import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import './styles/Toast.css';
import './styles/Loading.css';
import { NotificationProvider } from './lib/NotificationContext';
import { NotificationContainer } from './components/NotificationContainer';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <NotificationProvider>
      <BrowserRouter>
        <NotificationContainer />
        <App />
      </BrowserRouter>
    </NotificationProvider>
  </StrictMode>,
);
