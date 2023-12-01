import { createContext, useEffect, useState } from "react";
import ServicesTable from "../components/services-table/Services-Table";

export const ContextData = createContext({
    loading: true,
    services: []
  })


export default function ServicesPage() {
    const [loadingState, setLoadingState] = useState(true)
    const [services, setServices] = useState([])
    useEffect(()=>{
        console.log("Fetching Data...")
        console.log(services)
        setLoadingState(true)
        const getData = () =>{
            fetch("https://api.npoint.io/1ebdf9d8f718d80d365f").then(async (resp)=>{
            setServices(await resp.json())
        })
        }
        
        setLoadingState(false)
    })
    return (
    <ContextData.Provider value={{
        loading: loadingState,
        services: services,
    }}>
    <div className="flex max-w-4xl ">
    <ServicesTable />
    </div>
    </ContextData.Provider>
    )
}