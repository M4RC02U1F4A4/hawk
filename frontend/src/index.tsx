import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { NextUIProvider } from '@nextui-org/react';
import './index.css'

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <NextUIProvider>
      <main className='dark text-foreground bg-background min-h-screen'>
      <App />
      </main>
    </NextUIProvider>
  </React.StrictMode>
);