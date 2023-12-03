import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import {NavBar } from "./components/NavBar";
import ServicesPage from './pages/Services';
import HomePage from './pages/Home';

const router = createBrowserRouter([
  {path: "/",
  element: <HomePage />
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



export default function App() {
  return (
    <div className='h-screen w-full'>
    <NavBar />
    <RouterProvider router={router} />
   </div>
  );
}
