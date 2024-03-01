import React, { createContext, useContext, useState, useEffect } from "react";
import config from "../config";
const DataContext = createContext();

export const useDataContext = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [servicesData, setServicesData] = useState({});
  const [scriptsData, setScriptsData] = useState({});
  const [attackStatusData, setAttackStatusData] = useState({});

  const fetchServices = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/get/services`);
      const servicesData = await response.json();
      setServicesData(servicesData.data);
    } catch (error) {
      console.error("Errore nella richiesta API per i services:", error);
    }
  };

  const fetchScripts = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/get/scripts`);
      const scriptsData = await response.json();
      setScriptsData(scriptsData.data);
    } catch (error) {
      console.error("Errore nella richiesta API per gli scripts:", error);
    }
  };
  const fetchAttackStatus = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/attack/status`);
      const attackStatusData = await response.json();
      setAttackStatusData(attackStatusData.data);
    } catch (error) {
      console.error("Errore nella richiesta API per gli scripts:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchServices();
      await fetchScripts();
      await fetchAttackStatus();
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <DataContext.Provider
      value={{
        servicesData,
        fetchServices,
        scriptsData,
        fetchScripts,
        attackStatusData,
        fetchAttackStatus,
      }}>
      {children}
    </DataContext.Provider>
  );
};
