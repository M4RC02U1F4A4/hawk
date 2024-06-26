import React, { useState, useEffect } from 'react';
import { useDataContext } from '../context/Data';
import { useDisclosure, Card, CardHeader, CardBody, Button, Textarea, Chip, Progress } from "@nextui-org/react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input } from "@nextui-org/react";
import config from "../config";
import { toast } from 'react-toastify';
import SingleFileUploader from "./components/FileUploader";


export default function Farm() {
  const {
    farmStatusData,
    flagsData,
    fetchFarmStatus,
    fetchFlags,
    submitScriptData,
    fetchSubmitScript,
    activePage,
  } = useDataContext();
  const [startingFarm, setStartingFarm] = useState(false);
  const [stoppingFarm, setStoppingFarm] = useState(false);
  const [manualFlags, setManualFlags] = useState("");
  const [scriptFile, setScriptFile] = useState();
  const [requirementsFile, setRequirementsFile] = useState();
  const [farmLogs, setFarmLogs] = useState();
  const [fetchLogsIntervalId, setFetchLogsIntervalId] = useState(null);
  const { isOpen: isOpenFarmScript, onOpen: onOpenFarmScript, onOpenChange: onOpenChangeFarmScript, onClose: onCloseFarmScript } = useDisclosure();

  const handleAddSubmitScript = async () => {
    try {
      if (!scriptFile || !requirementsFile) {
        toast.error("Please upload script and requirements files.");
        return;
      }

      const formData = new FormData();

      formData.append("submit_script", scriptFile);
      formData.append("submit_requirements", requirementsFile);
      const response = await fetch(
        `${config.API_BASE_URL}/farm/submit/script/add`,
        {
          method: "POST",
          body: formData,
        }
      );

      const responseData = await response.json();

      if (response.ok && responseData.status === "OK") {
        toast.success(responseData.message);
        fetchSubmitScript();
        onCloseFarmScript();
      } else {
        toast.error(responseData.message || "Failed to update submit script.");
      }
    } catch (error) {
      console.error("Error updating script:", error);
      toast.error("API error");
    }
  };

  const handleFarmStart = async () => {
    try {
      setStartingFarm(true);
      const response = await fetch(`${config.API_BASE_URL}/farm/start`, {
        method: "GET",
      });
      const responseData = await response.json();
      if (response.ok && responseData.status === "OK") {
        let phase = null;
        while (phase !== "Running" && phase !== "Failed") {
          const statusResponse = await fetch(
            `${config.API_BASE_URL}/farm/status`
          );
          const statusData = await statusResponse.json();
          phase = statusData.data.phase;
          if (phase !== "Running" && phase !== "Failed") {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }
        toast.success(responseData.message);
        fetchFarmStatus();
      } else {
        toast.error(responseData.message || "Failed to start farm.");
      }
    } catch (error) {
      console.error("Error starting farm:", error);
      toast.error("API error");
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
      const response = await fetch(`${config.API_BASE_URL}/farm/flags/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ flags: manualFlags }),
      });
      const responseData = await response.json();
      if (response.ok && responseData.status === "OK") {
        toast.success(responseData.message);
        fetchFlags();
      } else {
        toast.error("Failed to submit flags");
      }
    } catch (error) {
      console.error("Error submitting flags:", error);
      toast.error("API error");
    }
  };

  const fetchFarmLogs = async (id) => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/farm/logs`);
      const responseData = await response.json();
      if (response.ok && responseData.status === "OK") {
        setFarmLogs(responseData.data);
      } else {
        toast.error(`Failed to fetch farm logs.`);
      }
    } catch (error) {
      console.error("Error fetching farm logs:", error);
      toast.error(`Failed to fetch farm logs.`);
    }
  };

  useEffect(() => {
    if (farmStatusData && farmStatusData["phase"] === "Running") {
      const intervalId = setInterval(() => {
        fetchFarmLogs();
      }, 2000);

      setFetchLogsIntervalId(intervalId);
    } else {
      clearInterval(fetchLogsIntervalId);
      setFetchLogsIntervalId(null);
    }
    return () => {
      clearInterval(fetchLogsIntervalId);
    };
  }, [farmStatusData]);

  useEffect(() => {
    let intervalId;
    if (activePage == "farm") {
      fetchFarmStatus();
      fetchFlags();
      fetchSubmitScript();
      intervalId = setInterval(() => {
        fetchFarmStatus();
        fetchFlags();
        fetchSubmitScript();
      }, 5000);
    }
    return () => {
      clearInterval(intervalId);
    };
  }, [activePage]);

  return (
    <>
      <div className="px-10 m-1 mt-10">
        {startingFarm ? (
          <Button fullWidth size="lg" color="primary" isLoading>
            STARTING
          </Button>
        ) : stoppingFarm ? (
          <Button fullWidth size="lg" color="danger" isLoading>
            STOPPING
          </Button>
        ) : farmStatusData && farmStatusData["phase"] === "Running" ? (
          <Button
            fullWidth
            size="lg"
            color="danger"
            variant="ghost"
            onClick={() => handleFarmStop()}>
            STOP
          </Button>
        ) : (
          <Button
            fullWidth
            size="lg"
            color="primary"
            variant="ghost"
            onClick={() => handleFarmStart()}>
            START
          </Button>
        )}
      </div>
      <div className="grid grid-cols-5 gap-4 px-10 m-1 mt-10">
        <FarmCard title="total" dataKey="total" flagsData={flagsData} />
        <FarmCard title="queued" dataKey="queued" flagsData={flagsData} />
        <FarmCard title="accepted" dataKey="accepted" flagsData={flagsData} />
        <FarmCard title="rejected" dataKey="rejected" flagsData={flagsData} />
        <FarmCard title="error" dataKey="error" flagsData={flagsData} />
      </div>
      <div className="grid grid-cols-5 gap-4 px-10 m-1 mt-10 flex">
        <div className='col-start-1 col-end-3 flex flex-col space-y-4'>
          {submitScriptData && submitScriptData["status"] === "OK" ? (
            <Card className='h-full'>
              <CardBody className="flex items-center justify-center h-full">
                <p className="font-mono text-2xl text-success">FARM READY TO START</p>
              </CardBody>
            </Card>
          ) : submitScriptData && submitScriptData["status"] === "ERROR" ? (
            <Card className='h-full'>
              <CardBody className="flex items-center justify-center h-full">
                <p className="font-mono text-2xl text-danger">NO SUBMIT SCRIPT FOUND</p>
              </CardBody>
            </Card>
          ) : (
            <></>
          )}
            <div className="mt-auto">
              <Button
                className="mt-4"
                fullWidth
                size="lg"
                color="primary"
                variant="ghost"
                onPress={onOpenFarmScript}>
                EDIT FARM SUBMIT SCRIPT
              </Button>
            </div>
          </div>
          <div className='col-start-3 col-end-6 flex flex-col space-y-4'>
            <Textarea
              label="MANUAL FLAGS SUBMISSIONS"
              value={manualFlags}
              onChange={(e) => setManualFlags(e.target.value)}
            />
            <div className="mt-auto">
              <Button
                className="mt-4"
                fullWidth
                size="lg"
                color="primary"
                variant="ghost"
                onClick={handleSubmit}>
                SUBMIT
              </Button>
            </div>
          </div>
        </div>
      <div>
        {farmStatusData && farmStatusData["phase"] === "Running" && (
          <div className="grid grid-cols-1 px-10 mt-10 ">
            <div className="flex justify-center">
              <pre aria-label="logs" className="font-mono text-sm">
                {farmLogs}
              </pre>
            </div>
            <div className="flex justify-center mt-5">
              <Progress
                aria-label="progress-bar"
                size="sm"
                isIndeterminate
                className="max-w-md"
              />
            </div>
          </div>
        )}
      </div>

      <Modal
          isOpen={isOpenFarmScript}
          onOpenChange={onOpenChangeFarmScript}
          className="dark text-foreground bg-background"
          backdrop="blur"
          hideCloseButton>
          <ModalContent>
            {(onCloseFarmScript) => (
              <>
                <ModalHeader>Edit farm submit script</ModalHeader>
                <ModalBody>
                <div className=''>
                  <div>
                  <SingleFileUploader
                    title={"Submit Script"}
                    onFileChange={(item) => {
                      setScriptFile(item);
                    }}
                  />
                  <SingleFileUploader
                    title={"Requirements"}
                    onFileChange={(item) => {
                      setRequirementsFile(item);
                    }}
                  />
                  </div>
                </div>
                </ModalBody>
                <ModalFooter>
                  <Button
                    color="danger"
                    variant="light"
                    className="mt-4"
                    onPress={onCloseFarmScript}>Cancel</Button>
                  <Button
                      className="mt-4"
                      fullWidth
                      color="primary"
                      onClick={handleAddSubmitScript}>
                      Update submit script
                    </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
    </>
  );
}

export function FarmCard({ title, dataKey, flagsData }) {
  return (
    <Card>
      <CardHeader className="flex justify-center gap-3">
        <p className="text-2xl uppercase ">{title}</p>
      </CardHeader>
      <CardBody className="text-center">
        <p className="font-mono text-xl">{flagsData[dataKey]}</p>
      </CardBody>
    </Card>
  );
}