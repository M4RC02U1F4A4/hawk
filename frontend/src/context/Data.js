import React, { createContext, useContext, useState, useEffect } from "react";
import config from "../config";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const DataContext = createContext();

export const useDataContext = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  // Loading useStates
  const [mainLoading, setMainLoading] = useState(true);

  // Data
  const [servicesData, setServicesData] = useState([]);
  const [scriptsData, setScriptsData] = useState([]);
  const [attackStatusData, setAttackStatusData] = useState([]);
  const [farmStatusData, setFarmStatusData] = useState([]);
  const [startupData, setStartupData] = useState({});
  const [flagsData, setFlagsData] = useState({});
  const [submitScriptData, setSubmitScriptData] = useState({});

  // Page Controller
  const [activePage, setActivePage] = useState(
    localStorage.getItem("activePage") || "attacks"
  );

  const fetchServices = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/services/get`);
      const servicesData = await response.json();
      setServicesData(servicesData.data);
    } catch (error) {
      console.error("Services API request error:", error);
      toast.error("Services API error");
    }
  };

  const fetchScripts = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/scripts/get`);
      const scriptsData = await response.json();
      setScriptsData(scriptsData.data);
    } catch (error) {
      console.error("Scripts API request error:", error);
      toast.error("Scripts API error");
    }
  };
  const fetchAttackStatus = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/attack/status`);
      const attackStatusData = await response.json();
      setAttackStatusData(attackStatusData.data);
    } catch (error) {
      console.error("Attacks status API request error:", error);
      toast.error("Attacks API error");
    }
  };
  const fetchFarmStatus = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/farm/status`);
      const farmStatusData = await response.json();
      setFarmStatusData(farmStatusData.data);
    } catch (error) {
      console.error("Farm status API request error:", error);
      toast.error("Farm API error");
    }
  };
  const fetchStartup = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/startup`);
      const startupData = await response.json();
      setStartupData(startupData.data);
    } catch (error) {
      console.error("Startup variables API request error:", error);
      toast.error("Startup variables API error");
    }
  };
  const fetchFlags = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/farm/flags/get`);
      const flagsData = await response.json();
      setFlagsData(flagsData.data);
    } catch (error) {
      console.error("Error fetching flags:", error);
      toast.error("Error fetching flags");
    }
  };
  const fetchSubmitScript = async () => {
    try {
      const response = await fetch(
        `${config.API_BASE_URL}/farm/submit/script/status`
      );
      const submitScriptData = await response.json();
      setSubmitScriptData(submitScriptData);
    } catch (error) {
      console.error("Error fetching submit script:", error);
      toast.error("Error fetching submit script");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setMainLoading(true);
      console.log("Fetching Data ...");
      await fetchServices();
      await fetchScripts();
      await fetchAttackStatus();
      await fetchStartup();
      await fetchFarmStatus();
      await fetchFlags();
      await fetchSubmitScript();
      console.log("Fetch Done.");
      setMainLoading(false);
    };
    fetchData();
  }, []);

  return (
    <DataContext.Provider
      value={{
        activePage,
        setActivePage,
        mainLoading,
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
        fetchSubmitScript,
      }}>
      {children}
    </DataContext.Provider>
  );
};
