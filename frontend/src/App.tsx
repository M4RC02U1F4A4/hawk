import {Button} from "@nextui-org/button"

import React, { createContext, useState, useEffect } from "react";
import { RouterProvider, createBrowserRouter, unstable_BlockerFunction } from 'react-router-dom';
import {NavBar } from "./components/NavBar";
import ServicesPage from "./pages/services";
import { log } from "console";


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
  type Service = {
    _id: string,
    name: string,
    port: number
  }
  type Script = {
    id: string,
    name: string,
    service: string,
    requirements: File,
    script: File
  }
  type ContextType = {
    loadingState: boolean | undefined,
    services: Service[] | undefined,
    scripts: Script[] | undefined
  }
  
  const [services, setServices] = useState<Service[]>()
  const [scripts, setScripts] = useState<Script[]>()
  const [loadingState, setLoadingState] = useState<boolean>()
  
  const ContextData = createContext<ContextType | null>(null)

  const getServicesFromAPI = async (): Promise<Service[]> => {
    const resl = await fetch('http://localhost:5001/get/services') 
    if (!resl.ok) {
      throw new Error('Failed to get services')
    }
    
    const responseData = await resl.json()
    if (responseData && responseData.data) {
      return responseData.data;
    } 
    else {
      throw new Error('Invalid response format');
    }
  }

  const fetchAllData= async () =>{
    const services = await getServicesFromAPI()
    services.map((value)=>{
      const service: Service = {
        name: value.name,
        _id: value._id,
        port: value.port
      }
      services?.push(service)
    })
  }
  useEffect(()=>{
    console.log("Getting data....")
    setLoadingState(true)
    fetchAllData().then(()=>{
      console.log("Data Retrived")
      setLoadingState(false)
    })
  },[])



  return (
    <ContextData.Provider value={{loadingState: loadingState, services: services, scripts: scripts}}>
      <div className=''>
        <NavBar />
          <RouterProvider router={router} />
      </div>
    </ContextData.Provider>
  );
}

export default App;
