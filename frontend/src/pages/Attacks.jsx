import React, { useState, useEffect } from 'react';
import { useDataContext } from '../context/Data';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Tooltip} from "@nextui-org/react";
import { Modal, useDisclosure, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } from "@nextui-org/react";
import {Select, SelectItem} from "@nextui-org/react";
import { toast } from 'react-toastify';
import {EditIcon} from "./icons/EditIcon";
import {DeleteIcon} from "./icons/DeleteIcon";
import {EyeIcon} from "./icons/EyeIcon";
import config from "../config";
import SingleFileUploader from "./components/FileUploader";

export default function Attacks() {
  const {
    scriptsData,
    fetchScripts,
    attackStatusData,
    servicesData,
    fetchAttackStatus,
  } = useDataContext();
  const [loading, setLoading] = useState(true);
  const [startingAttacks, setStartingAttacks] = useState([]);
  const [stoppingAttacks, setStoppingAttacks] = useState([]);
  const [restartingAttacks, setRestartingAttacks] = useState([]);
  const [attackLogsID, setAttackLogsID] = useState();
  const [attackLogs, setAttackLogs] = useState();
  const {
    isOpen: isOpenAddScript,
    onOpen: onOpenAddScript,
    onOpenChange: onOpenChangeAddScript,
    onClose: onCloseAddScript,
  } = useDisclosure();
  const {
    isOpen: isOpenLogs,
    onOpen: onOpenLogs,
    onOpenChange: onOpenChangeLogs,
    onClose: onCloseLogs,
  } = useDisclosure();

  useEffect(() => {
    if (scriptsData.length > 0 && attackStatusData.length >= 0) {
      setLoading(false);
    }
  }, [scriptsData, attackStatusData]);

  function formatUptime(uptimeInSeconds) {
    const hours = Math.floor(uptimeInSeconds / 3600);
    const minutes = Math.floor((uptimeInSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeInSeconds % 60);
    return `${hours.toString().padStart(2, "0")}h ${minutes
      .toString()
      .padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`;
  }

  function getStatusAndUptimeById(id) {
    for (const item of attackStatusData) {
      if (item.name.includes(id)) {
        return {
          status: item.phase,
          uptime: formatUptime(item.uptime),
        };
      }
    }
    return {
      status: "NA",
      uptime: "NA",
    };
  }

    function getServiceName(id) {;
        for (const item of servicesData) {
            if (item._id.includes(id)) {
                return item.name;
            }
        }
    }

    const handleDeleteScript = async (id) => {
        try {
            const statusResponse = await fetch(`${config.API_BASE_URL}/attack/status/${id}`);
            const statusData = await statusResponse.json();
    
            if (statusResponse.ok && statusData.status === 'ERROR') {
                const response = await fetch(`${config.API_BASE_URL}/delete/script`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ id })
                });
                const responseData = await response.json();
                if (response.ok && responseData.status === 'OK') {
                    fetchScripts();
                    toast.success(responseData.message);
                } else {
                    toast.error(responseData.message || 'Failed to remove script.');
                }
            } else {
                toast.error('Stop the attack before deleting the script.');
            }
        } catch (error) {
            console.error('Error removing script:', error);
            toast.error('API error');
        }
    }
    

    const handleAttackStart = async (id) => {
        try {
            setStartingAttacks([...startingAttacks, id]);
            const response = await fetch(`${config.API_BASE_URL}/attack/start/${id}`, {
                method: 'GET'
            });
            const responseData = await response.json();
            if (response.ok && responseData.status === 'OK') {
                let phase = null;
                while (phase !== 'Running' && phase !== 'Failed') {
                    const statusResponse = await fetch(`${config.API_BASE_URL}/attack/status/${id}`);
                    const statusData = await statusResponse.json();
                    phase = statusData.data.phase;
                    if (phase !== 'Running' && phase !== 'Failed') {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
            }
            setStartingAttacks(prevStartingAttacks => prevStartingAttacks.filter(StartingId => StartingId !== id));
            toast.success(responseData.message);
            fetchAttackStatus();
            } else {
                toast.error(responseData.message || 'Failed to start attack.');
            }
        } catch (error) {
            console.error('Error starting attack:', error);
            toast.error('API error');
            setStartingAttacks(prevStartingAttacks => prevStartingAttacks.filter(StartingId => StartingId !== id));
        }
    };

  const handleAttackStop = async (id) => {
    try {
      setStoppingAttacks([...stoppingAttacks, id]);
      const response = await fetch(`${config.API_BASE_URL}/attack/stop/${id}`, {
        method: "GET",
      });
      const responseData = await response.json();
      if (response.ok && responseData.status === "OK") {
        let status = null;
        while (status !== "ERROR") {
          const statusResponse = await fetch(
            `${config.API_BASE_URL}/attack/status/${id}`
          );
          const statusData = await statusResponse.json();
          status = statusData.status;
          if (status !== "ERROR") {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }
        setStoppingAttacks((prevStoppingAttacks) =>
          prevStoppingAttacks.filter((StoppingId) => StoppingId !== id)
        );
        toast.success(responseData.message);
        fetchAttackStatus();
      } else {
        toast.error(responseData.message || "Failed to stop attack.");
        setStoppingAttacks((prevStoppingAttacks) =>
          prevStoppingAttacks.filter((StoppingId) => StoppingId !== id)
        );
      }
    } catch (error) {
      console.error("Error stopping attack:", error);
      toast.error("API error");
    }
  };

  const handleAttackRestart = async (id) => {
    try {
      setRestartingAttacks([...restartingAttacks, id]);
      const responseStop = await fetch(
        `${config.API_BASE_URL}/attack/stop/${id}`,
        {
          method: "GET",
        }
      );
      const responseDataStop = await responseStop.json();
      if (responseStop.ok && responseDataStop.status === "OK") {
      } else {
        toast.error(responseDataStop.message || "Failed to stop attack.");
      }
      const responseStart = await fetch(
        `${config.API_BASE_URL}/attack/start/${id}`,
        {
          method: "GET",
        }
      );
      const responseDataStart = await responseStart.json();
      if (responseStart.ok && responseDataStart.status === "OK") {
        let phase = null;
        while (phase !== "Running" && phase !== "Failed") {
          const statusResponse = await fetch(
            `${config.API_BASE_URL}/attack/status/${id}`
          );
          const statusData = await statusResponse.json();
          phase = statusData.data.phase;
          if (phase !== "Running" && phase !== "Failed") {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }
        setRestartingAttacks((prevRestartingAttacks) =>
          prevRestartingAttacks.filter((RestartingId) => RestartingId !== id)
        );
        toast.success(`Attack with script ID ${id} restarted.`);
        fetchAttackStatus();
      } else {
        toast.error(responseDataStart.message || "Failed to start attack.");
      }
    } catch (error) {
      console.error("Error starting attack:", error);
      toast.error("API error");
      setRestartingAttacks((prevRestartingAttacks) =>
        prevRestartingAttacks.filter((RestartingId) => RestartingId !== id)
      );
    }
  };

  const handleViewLogs = async (id) => {
    setAttackLogsID(id);
    fetchAttackLogs(id);
    onOpenLogs();
  };

  useEffect(() => {
    let intervalId;
    if (isOpenLogs) {
      intervalId = setInterval(() => {
        fetchAttackLogs(attackLogsID);
      }, 10000);
    }
    return () => {
      clearInterval(intervalId);
    };
  }, [isOpenLogs, attackLogsID]);

  const fetchAttackLogs = async (id) => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/attack/logs/${id}`);
      const responseData = await response.json();
      if (response.ok && responseData.status === "OK") {
        setAttackLogs(responseData.data);
      } else {
        toast.error(`Failed to fetch attack logs for script with ID ${id}.`);
        onCloseLogs();
      }
    } catch (error) {
      console.error("Error fetching attack logs:", error);
      toast.error(`Failed to fetch attack logs for script with ID ${id}.`);
    }
  };

    if (loading) {
      return (
        <div className="flex justify-center m-1 mt-10">
          <Table removeWrapper>
            <TableHeader>
              <TableColumn>NAME</TableColumn>
              <TableColumn>ID</TableColumn>
              <TableColumn>SERVICE</TableColumn>
              <TableColumn className="text-center">USERNAME</TableColumn>
              <TableColumn className="text-center">FLAGS</TableColumn>
              <TableColumn className="text-center">AGE</TableColumn>
              <TableColumn className="text-center">STATUS</TableColumn>
              <TableColumn className="text-center">ATTACK</TableColumn>
              <TableColumn className="text-center">ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent={"Loading..."}>{[]}</TableBody>
          </Table>
        </div>
      );
    }

    return (
      <>
        <div className="flex justify-center m-1 mt-10">
          <Table removeWrapper>
            <TableHeader>
              <TableColumn>NAME</TableColumn>
              <TableColumn>ID</TableColumn>
              <TableColumn>SERVICE NAME</TableColumn>
              <TableColumn>SERVICE ID</TableColumn>
              <TableColumn className="text-center">USERNAME</TableColumn>
              <TableColumn className="text-center">FLAGS</TableColumn>
              <TableColumn className="text-center">AGE</TableColumn>
              <TableColumn className="text-center">STATUS</TableColumn>
              <TableColumn className="text-center">ATTACK</TableColumn>
              <TableColumn className="text-center">ACTIONS</TableColumn>
            </TableHeader>
            <TableBody>
              {scriptsData.map((scripts, index) => (
                <TableRow key={index}>
                  <TableCell className="font-bold">{scripts.name}</TableCell>
                  <TableCell className="font-mono">{scripts._id}</TableCell>
                  <TableCell className="font-mono">
                    {getServiceName(scripts.service)}
                  </TableCell>
                  <TableCell className="font-mono">{scripts.service}</TableCell>
                  <TableCell className="font-mono text-center uppercase">
                    {scripts.username}
                  </TableCell>
                  <TableCell className="font-mono text-center">
                    {scripts.flags}
                  </TableCell>
                  <TableCell className="font-mono text-center">
                    {getStatusAndUptimeById(scripts._id)["uptime"]}
                  </TableCell>
                  <TableCell className="font-mono text-center">
                    {getStatusAndUptimeById(scripts._id)["status"] ===
                    "Failed" ? (
                      <Chip size="sm" variant="dot" color="danger">
                        {getStatusAndUptimeById(scripts._id)["status"]}
                      </Chip>
                    ) : getStatusAndUptimeById(scripts._id)["status"] ===
                      "Running" ? (
                      <Chip size="sm" variant="dot" color="success">
                        {getStatusAndUptimeById(scripts._id)["status"]}
                      </Chip>
                    ) : (
                      <Chip size="sm" variant="dot" color="primary">
                        {getStatusAndUptimeById(scripts._id)["status"]}
                      </Chip>
                    )}
                  </TableCell>
                  <TableCell className="w-40 font-mono text-center">
                    {startingAttacks.includes(scripts._id) ? (
                      <Button fullWidth size="sm" color="primary" isLoading>
                        STARTING
                      </Button>
                    ) : stoppingAttacks.includes(scripts._id) ? (
                      <Button fullWidth size="sm" color="danger" isLoading>
                        STOPPING
                      </Button>
                    ) : restartingAttacks.includes(scripts._id) ? (
                      <Button fullWidth size="sm" color="warning" isLoading>
                        RESTARTING
                      </Button>
                    ) : getStatusAndUptimeById(scripts._id)["status"] ===
                      "Failed" ? (
                      <Button
                        fullWidth
                        size="sm"
                        color="warning"
                        variant="ghost"
                        onClick={() => handleAttackRestart(scripts._id)}>
                        RESTART
                      </Button>
                    ) : getStatusAndUptimeById(scripts._id)["status"] ===
                      "Running" ? (
                      <Button
                        fullWidth
                        size="sm"
                        color="danger"
                        variant="ghost"
                        onClick={() => handleAttackStop(scripts._id)}>
                        STOP
                      </Button>
                    ) : (
                      <Button
                        fullWidth
                        size="sm"
                        color="primary"
                        variant="ghost"
                        onClick={() => handleAttackStart(scripts._id)}>
                        START
                      </Button>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Tooltip content="View logs">
                        <span className="text-lg cursor-pointer text-default-400 active:opacity-50">
                          <EyeIcon
                            onClick={() => handleViewLogs(scripts._id)}
                          />
                        </span>
                      </Tooltip>
                      <Tooltip content="Edit script">
                        <span className="text-lg cursor-pointer text-default-400 active:opacity-50">
                          <EditIcon />
                        </span>
                      </Tooltip>
                      <Tooltip color="danger" content="Delete script">
                        <span className="text-lg cursor-pointer text-danger active:opacity-50">
                          <DeleteIcon
                            onClick={() => handleDeleteScript(scripts._id)}
                          />
                        </span>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-center mt-10">
          <Button
            className="w-1/2 "
            color="primary"
            variant="ghost"
            fullWidth="true"
            onPress={onOpenAddScript}>
            ADD
          </Button>
          <Modal
            isOpen={isOpenAddScript}
            onOpenChange={onOpenChangeAddScript}
            className="dark text-foreground bg-background"
            backdrop="blur"
            hideCloseButton>
            <ModalContent>
              {(onCloseAddScript) => (
                <>
                  <ModalHeader>Add Attack</ModalHeader>
                  <ModalBody>
                    <Input label="Attack Name" className="w-full" />
                    <Select label="Service" className="w-full">
                      {servicesData.map((service) => (
                        <SelectItem key={service.name} value={service.name}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </Select>
                    <SingleFileUploader title={"Attack Script"} />
                    <SingleFileUploader title={"Attack Requirements"} />
                  </ModalBody>
                  <ModalFooter>
                    <Button
                      color="danger"
                      variant="light"
                      onPress={onCloseAddScript}>
                      {" "}
                      Cancel{" "}
                    </Button>
                    <Button color="primary"> Add </Button>
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          </Modal>
        </div>
        <Modal
          isOpen={isOpenLogs}
          onOpenChange={onOpenChangeLogs}
          className="dark text-foreground bg-background"
          backdrop="blur"
          hideCloseButton
          size="5xl"
          scrollBehavior="inside">
          <ModalContent>
            {(onCloseLogs) => (
              <>
                <ModalHeader>
                  Logs for attack script with ID {attackLogsID}
                </ModalHeader>
                <ModalBody>
                  <pre className="font-mono text-sm">{attackLogs}</pre>
                </ModalBody>
              </>
            )}
          </ModalContent>
        </Modal>
      </>
    );
}
