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
    await getServicesAPI();
  };

  const getServicesAPI = async () => {
    const resl = await fetch("http://localhost:5001/get/services");
    if (!resl.ok) {
      throw new Error("Failed to get services");
    }

    const responseData = await resl.json();
    if (responseData && responseData.data) {
      setServices(responseData.data);
    } else {
      throw new Error("Invalid response format");
    }
  };

  const addServiceAPI = async (service: Service) => {
    const resl = await fetch("http://localhost:5001/add/service", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: service.name,
        port: service.port,
      }),
    });
    if (!resl.ok) {
      throw new Error("Failled to add service");
    }
  };

  const editServiceAPI = async (service: Service) => {
    const resl = await fetch("http://localhost:5001/edit/service", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: service._id,
        name: service.name,
        port: service.port,
      }),
    });
    if (!resl.ok) {
      throw new Error("Failled to edit service");
    }
    getServicesAPI();
    return true;
  };

  const deleteServiceAPI = async (service: Service) => {
    const resl = await fetch("http://localhost:5001/delete/service", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: service._id,
      }),
    });
    if (!resl.ok) {
      throw new Error("Failled to delete service: " + service._id);
    }
    getServicesAPI();
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
    <DataContext.Provider
      value={{
        services,
        scripts,
        loadingState,
        servicesFunctions: {
          addServiceAPI,
          editServiceAPI,
          deleteServiceAPI,
          getServicesAPI,
        },
      }}
    >
      {props.children}
    </DataContext.Provider>
  );
};
