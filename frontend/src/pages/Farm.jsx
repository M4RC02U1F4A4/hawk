import React, { useState } from 'react';
import { useDataContext } from '../context/Data';
import { Card, CardHeader, CardBody, Button, Textarea } from "@nextui-org/react";
import config from "../config";
import { toast } from 'react-toastify';



export default function Farm() {
  const { farmStatusData, flagsData, fetchFarmStatus, fetchFlags } = useDataContext();
  const [startingFarm, setStartingFarm] = useState(false);
  const [stoppingFarm, setStoppingFarm] = useState(false);
  const [manualFlags, setManualFlags] = useState('');

  const handleFarmStart = async () => {
    try {
      setStartingFarm(true);
      const response = await fetch(`${config.API_BASE_URL}/farm/start`, {
        method: 'GET'
      });
      const responseData = await response.json();
      if (response.ok && responseData.status === 'OK') {
        let phase = null;
        while (phase !== 'Running' && phase !== 'Failed') {
          const statusResponse = await fetch(`${config.API_BASE_URL}/farm/status`);
          const statusData = await statusResponse.json();
          phase = statusData.data.phase;
          if (phase !== 'Running' && phase !== 'Failed') {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        toast.success(responseData.message);
        fetchFarmStatus();
      } else {
        toast.error(responseData.message || 'Failed to start farm.');
      }
    } catch (error) {
      console.error('Error starting farm:', error);
      toast.error('API error');
      
    } finally {
      setStartingFarm(false);
    }
  };

  const handleFarmStop = async () => {
    try {
      setStoppingFarm(true);
      const response = await fetch(`${config.API_BASE_URL}/farm/stop`, {
        method: "GET",
      });
      const responseData = await response.json();
      if (response.ok && responseData.status === "OK") {
        let status = null;
        while (status !== "ERROR") {
          const statusResponse = await fetch(
            `${config.API_BASE_URL}/farm/status`
          );
          const statusData = await statusResponse.json();
          status = statusData.status;
          if (status !== "ERROR") {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }
        toast.success(responseData.message);
        fetchFarmStatus();
      } else {
        toast.error(responseData.message || "Failed to stop farm.");
      }
    } catch (error) {
      console.error("Error stopping farm:", error);
      toast.error("API error");
    } finally {
      setStoppingFarm(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/submit/flags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ flags: manualFlags })
      });
      const responseData = await response.json();
      if (response.ok && responseData.status === 'OK') {
        toast.success(responseData.message);
        fetchFlags();
      } else {
        toast.error("Failed to submit flags");
      }
    } catch (error) {
      console.error('Error submitting flags:', error);
      toast.error("API error");
    }
  };

  return (
    <>
      <div className='m-1 mt-10 px-10'>
      {startingFarm ? (
        <Button fullWidth size="lg" color="primary" isLoading>
          STARTING
        </Button>
      ) : stoppingFarm ? (
        <Button fullWidth size="lg" color="danger" isLoading>
          STOPPING
        </Button>
      ) : farmStatusData && farmStatusData["phase"] === "Running" ? (
        <Button fullWidth size="lg" color="danger" variant="ghost" onClick={() => handleFarmStop()}>
          STOP
        </Button>
      ) : (
        <Button fullWidth size="lg" color="primary" variant="ghost" onClick={() => handleFarmStart()}>
          START
        </Button>
      )}
      </div>
      <div className='grid grid-cols-4 m-1 mt-10 px-10 gap-4'>
        <FarmCard title="total" dataKey="total" flagsData={flagsData} />
        <FarmCard title="accepted" dataKey="accepted" flagsData={flagsData} />
        <FarmCard title="rejected" dataKey="rejected" flagsData={flagsData} />
        <FarmCard title="error" dataKey="error" flagsData={flagsData} />
      </div>
      <div className='grid grid-cols-2 m-1 mt-10 px-10 gap-4'>
        <div></div>
        <div>
          <Textarea label="MANUAL FLAGS SUBMISSIONS" value={manualFlags} onChange={(e) => setManualFlags(e.target.value)}/>
          <Button className='mt-4' fullWidth size="lg" color="primary" variant="ghost" onClick={handleSubmit}>SUBMIT</Button>
        </div>
      </div>
    </>
  );
}

export function FarmCard({ title, dataKey, flagsData }) {
  return (
    <Card>
      <CardHeader className="flex gap-3 justify-center">
        <p className="text-2xl uppercase ">{title}</p>
      </CardHeader>
      <CardBody className='text-center'>
        <p className='font-mono text-xl'>{flagsData[dataKey]}</p>
      </CardBody>
    </Card>
  );
}