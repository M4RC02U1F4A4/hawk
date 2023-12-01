import {Button} from "@nextui-org/button"

import React, { createContext } from "react";
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import {NavBar } from "./components/NavBar";
import ServicesPage from "./pages/services";


const router = createBrowserRouter([
  {path: "/",
  element: <div>Home</div>
  },
  {path: "/services",
  element: <ServicesPage />
  },
  {path: "/info",
  element: <div>Info</div>
  },
  {path: "*",
  element: <div>404</div>
  },

])



function App() {
  return (
    <div className='h-screen w-full'>
    <NavBar />
    <RouterProvider router={router} />
   </div>
  );
}

export default App;
