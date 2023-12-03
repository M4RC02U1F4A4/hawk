import React, { useState, useEffect } from 'react';
import {Chip, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, CircularProgress, ModalHeader, ModalBody, ModalFooter, Modal, ModalContent, useDisclosure} from "@nextui-org/react";
import {VerticalDotsIcon} from "../icons/VerticalDotsIcon";


function HomeTable() {
  const [apiData, setApiData] = useState(null);
  
  const fetchData = async () => {
    try {

      const response = await fetch('http://localhost:5001/get/scripts');
      const result  = await response.json();

      if (JSON.stringify(result.data) !== JSON.stringify(apiData)) {
        setApiData(result.data);
      }
    } catch (error) {
      console.error('Errore durante la chiamata API', error);
    }
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 10000);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiData]);

  const handleRefreshClick = () => {
      fetchData();
  };


  return (
    <div className='flex flex-col gap-4'>
      <div className=''>
        <Table>
          <TableHeader>
            <TableColumn className='text-base'>NAME</TableColumn>
            <TableColumn className='text-base'>ID</TableColumn>
            <TableColumn className='text-base text-center'>SERVICE NAME</TableColumn>
            <TableColumn className='text-base text-center'>STATUS</TableColumn>
            <TableColumn className='text-base text-center'>ACTIONS</TableColumn>
          </TableHeader>
          {apiData ? (
            <TableBody>
              {apiData.map((item) => (
                <TableRow key={item._id}>
                  <TableCell className='font-bold'>{item.name}</TableCell>
                  <TableCell className='font-mono text-slate-400'>{item._id}</TableCell>
                  <TableCell>
                    <ServiceName serviceID={item.service} />
                  </TableCell>
                  <TableCell className='text-center'>
                    <PodStatus itemID={item._id} type='chip' />
                  </TableCell>
                  <TableCell className='flex items-center justify-center'>
                    <PodStatus itemID={item._id} type='button' />
                    <Action itemID={item._id} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          ) : (<TableBody emptyContent={"No rows to display."}>{[]}</TableBody>)}
        </Table>
      </div>
    </div>
  );
}

const PodStatus = ({ itemID, type }) => {
  const [statuses, setStatus] = useState('NA');

  const fetchStatus = async () => {
    try {
      const response = await fetch(`http://localhost:5001/status/${itemID}`);
      const data = await response.json();
      setStatus(data.data.phase.toUpperCase());
    } catch (error) {
      setStatus('NA');
    }
  };


  useEffect(() => {
    fetchStatus();
    const intervalId = setInterval(() => {
      fetchStatus();
    }, 5000);
    return () => {
      clearInterval(intervalId);
    };
  }); 

  const startPod = async () => {
    try {
      const response = await fetch(`http://localhost:5001/start/${itemID}`);
      const data = await response.json();
      setStatus('PENDING');
    } catch (error) {
      setStatus('NA');
      console.log("Start pod error");
    }
  };

  const stopPod = async () => {
    try {
      const response = await fetch(`http://localhost:5001/delete/${itemID}`);
      const data = await response.json();
      setStatus('NA');
    } catch (error) {
      setStatus('NA');
      console.log("Stop pod error");
    }
  };

  const deletePod = async () => {
    // const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))
    try {
      setStatus('DELETING');
      await fetch(`http://localhost:5001/delete/${itemID}`);
    } catch (error) {
      setStatus('NA');
      console.log("Delete pod error");
    }
  };

  const statusColorMap = {
    RUNNING: 'success',
    FAILED: 'danger',
    NA: 'default',
  };

  return (
    <div>
    {type === "button" && (
      <div>
        {statuses === 'NA' && (<Button color="primary" size='sm' variant='bordered' onClick={startPod}>START</Button>)}
        {statuses === 'PENDING' && (<Button color="primary" size='sm' variant='bordered' isLoading>STARTING</Button>)}
        {statuses === 'RUNNING' && (<Button color="danger" size='sm' variant='bordered' onClick={stopPod}>STOP</Button>)}
        {statuses === 'FAILED' && (<Button color="secondary" size='sm' variant='bordered' onClick={deletePod}>DELETE POD</Button>)}
        {statuses === 'DELETING' && (<Button color="secondary" size='sm' variant='bordered' isLoading>DELETING</Button>)}
      </div>
    )}
    {type === "chip" && (
      <div>
        <Chip size="sm" color={statusColorMap[statuses]} variant="flat">
        {statuses}
      </Chip>
      </div>
    )}
    </div>
  )
}

const ServiceName = ({ serviceID }) => {
  const [serviceName, setServiceName] = useState(null);

  const fetchStatus = async () => {
    try {
      const response = await fetch(`http://localhost:5001/get/services`);
      const data = await response.json();

      const serviceObject = data.data.find(service => service._id === serviceID);

      setServiceName(serviceObject.name);
    } catch (error) {
      setServiceName('ERROR');
    }
  };

  useEffect(() => {
    fetchStatus(); 
    const intervalId = setInterval(() => {
      fetchStatus();
    }, 10000);
    return () => {
      clearInterval(intervalId);
    };
  });

  return (
    <p className='text-center'>{serviceName}</p>
  )
}

function Action({ itemID }) {
  const [statuses, setStatus] = useState('NA');
  const [logsData, setLogsData] = useState(null);
  const {isOpen, onOpen, onOpenChange} = useDisclosure();


  const handleLogsClick = async () => {
    try {
      const response = await fetch(`http://localhost:5001/logs/${itemID}`);
      const jsonData = await response.json()
      const responseText = jsonData.data.replace(/\n/g, '<br>')

      setLogsData(responseText);
      onOpen();
    } catch (error) {
      setLogsData("Unable to fetch logs. Maybe the POD is not running.");
      onOpen();
    }
  };

  const handleDeleteClick = async () => {
    try {
      await fetch('http://localhost:5001/delete/script', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ "id": itemID }),
    });
    setStatus('DELETING');
    } catch (error) {
    }
  };

  return (
    <div>
      {statuses === 'NA' && (
      <Dropdown className='dark text-foreground bg-background'>
        <DropdownTrigger>
          <Button isIconOnly size="sm" variant="light">
            <VerticalDotsIcon className="text-default-300" />
          </Button>
        </DropdownTrigger>
        <DropdownMenu>
          <DropdownItem key='logs' onClick={handleLogsClick}>Logs</DropdownItem>
          <DropdownItem key='edit'>Edit</DropdownItem>
          <DropdownItem key='delete' className='text-danger' onClick={handleDeleteClick}>Delete</DropdownItem>
        </DropdownMenu>
      </Dropdown>
      )}
      {statuses === 'DELETING' && (
        <CircularProgress size="sm" color="danger" strokeWidth='2' />
      )}
      <Modal className='dark text-foreground bg-background' isOpen={isOpen} onOpenChange={onOpenChange} size='5xl' scrollBehavior='inside'>
        <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">{itemID}</ModalHeader>
            <ModalBody >
              <div dangerouslySetInnerHTML={{ __html: logsData }}></div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
        </ModalContent>
      </Modal>
    </div>
  )
}



export default function HomePage(){
  return (
    <div>
      <div className='mt-[3rem] flex justify-center'>
        <div className='w-[50rem]'>
          <HomeTable />
        </div>
      </div>
    </div>
  )
}