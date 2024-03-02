import React, { createContext, useContext, useState, useEffect } from "react";
import config from "../config";
const DataContext = createContext();

export const useDataContext = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [servicesData, setServicesData] = useState({});
  const [scriptsData, setScriptsData] = useState({});
  const [attackStatusData, setAttackStatusData] = useState({});
  const [startupData, setStartupData] = useState({});

  const fetchServices = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/get/services`);
      const servicesData = await response.json();
      setServicesData(servicesData.data);
    } catch (error) {
      console.error("Services API request error:", error);
    }
  };

  const fetchScripts = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/get/scripts`);
      const scriptsData = await response.json();
      setScriptsData(scriptsData.data);
    } catch (error) {
      console.error("Scripts API request error:", error);
    }
  };
  const fetchAttackStatus = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/attack/status`);
      const attackStatusData = await response.json();
      setAttackStatusData(attackStatusData.data);
    } catch (error) {
      console.error("Attacks status API request error:", error);
    }
  };
  const fetchStartup = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/startup`);
      const startupData = await response.json();
      setStartupData(startupData.data);
    } catch (error) {
      console.error("Startup variables API request error:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchServices();
      await fetchScripts();
      await fetchAttackStatus();
      await fetchStartup();
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
        startupData,
        fetchStartup
      }}>
      {children}
    </DataContext.Provider>
  );
};
