import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import {NextUIProvider} from "@nextui-org/react";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <NextUIProvider>
      <main className='dark text-foreground bg-background'>
      <App />
      </main> 
    </NextUIProvider>
  </React.StrictMode>
);
