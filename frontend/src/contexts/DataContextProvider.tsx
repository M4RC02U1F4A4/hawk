import { FC, ReactNode, createContext, useEffect, useState } from "react";
import { DataContextType } from "../types/ContextTypes";
import { Service } from "../types/ServicesTypes";
import { Script } from "../types/ScriptTypes";

export const DataContext = createContext<DataContextType | null>(null);

export const DataContextProvider = (props: { children: ReactNode }) => {
  const [loadingState, setLoadingState] = useState<boolean>(true);
  const [services, setServices] = useState<Service[]>();
  const [scripts, setScripts] = useState<Script[]>();

  const fetchAllData = async () => {
    const output = await getServicesAPI();
    setServices(output);
  };

  const getServicesAPI = async (): Promise<Service[]> => {
    const resl = await fetch("http://localhost:5001/get/services");
    if (!resl.ok) {
      throw new Error("Failed to get services");
    }

    const responseData = await resl.json();
    if (responseData && responseData.data) {
      return responseData.data;
    } else {
      throw new Error("Invalid response format");
    }
  };

  const addServiceAPI = async (service: Service) => {
    const resl = await fetch("http://localhost:5001/add/service", {
      method: "POST",
      body: JSON.stringify({
        name: service.name,
        port: service.port,
      }),
    });
    if (!resl.ok) {
      throw new Error("Failled to add service");
    }
  };

  const deleteServiceAPI = async (service: Service) => {
    const resl = await fetch("", {
      method: "DELETE",
      body: JSON.stringify({
        id: service._id,
      }),
    });
    if (!resl.ok) {
      throw new Error("Failled to delete service: " + service._id);
    }
  };

  useEffect(() => {
    console.log("Getting data....");
    fetchAllData().then(() => {
      setLoadingState(true);
      console.log("Data Retrived");
      setLoadingState(false);
    });
  }, []);

  return (
    <DataContext.Provider value={{ services, scripts, loadingState }}>
      {props.children}
    </DataContext.Provider>
  );
};
