import React, { createContext, useContext, useState, useEffect } from "react";
import config from "../config";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const DataContext = createContext();

export const useDataContext = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [servicesData, setServicesData] = useState([]);
  const [scriptsData, setScriptsData] = useState([]);
  const [attackStatusData, setAttackStatusData] = useState([]);
  const [farmStatusData, setFarmStatusData] = useState([]);
  const [startupData, setStartupData] = useState({});
  const [flagsData, setFlagsData] = useState({});
  const [submitScriptData, setSubmitScriptData] = useState({});

  const fetchServices = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/get/services`);
      const servicesData = await response.json();
      setServicesData(servicesData.data);
    } catch (error) {
      console.error("Services API request error:", error);
      toast.error('Services API error');
    }
  };

  const fetchScripts = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/get/scripts`);
      const scriptsData = await response.json();
      setScriptsData(scriptsData.data);
    } catch (error) {
      console.error("Scripts API request error:", error);
      toast.error('Scripts API error');
    }
  };
  const fetchAttackStatus = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/attack/status`);
      const attackStatusData = await response.json();
      setAttackStatusData(attackStatusData.data);
    } catch (error) {
      console.error("Attacks status API request error:", error);
      toast.error('Attacks API error');
    }
  };
  const fetchFarmStatus = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/farm/status`);
      const farmStatusData = await response.json();
      setFarmStatusData(farmStatusData.data);
    } catch (error) {
      console.error("Farm status API request error:", error);
      toast.error('Farm API error');
    }
  };
  const fetchStartup = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/startup`);
      const startupData = await response.json();
      setStartupData(startupData.data);
    } catch (error) {
      console.error("Startup variables API request error:", error);
      toast.error('Startup variables API error');
    }
  };
  const fetchFlags = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/farm/flags`);
      const flagsData = await response.json();
      setFlagsData(flagsData.data);
    } catch (error) {
      console.error("Error fetching flags:", error);
      toast.error('Error fetching flags');
    }
  };
  const fetchSubmitScript = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/farm/submit/status`);
      const submitScriptData = await response.json();
      setSubmitScriptData(submitScriptData);
    } catch (error) {
      console.error("Error fetching submit script:", error);
      toast.error('Error fetching submit script');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchServices();
      await fetchScripts();
      await fetchAttackStatus();
      await fetchStartup();
      await fetchFarmStatus();
      await fetchFlags();
      await fetchSubmitScript();
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
        fetchStartup,
        farmStatusData,
        fetchFarmStatus,
        flagsData,
        fetchFlags, 
        submitScriptData,
        fetchSubmitScript
      }}>
      {children}
    </DataContext.Provider>
  );
};
