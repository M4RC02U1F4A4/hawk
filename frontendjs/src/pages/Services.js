import React, { useState, useEffect } from 'react';
import {Modal, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Tooltip, useDisclosure, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input} from "@nextui-org/react";
import {DeleteIcon} from "../icons/DeleteIcon";
import {EditIcon} from "../icons/EditIcon";

function ServicesTable() {
  const [apiData, setApiData] = useState(null);
  
  const fetchData = async () => {
    try {

      const response = await fetch('http://localhost:5001/get/services');
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
            <TableColumn className='text-base text-center'>PORT</TableColumn>
            <TableColumn className='text-base text-center'>SCRIPTS</TableColumn>
            <TableColumn className='text-base text-center'>ACTIONS</TableColumn>
          </TableHeader>
          {apiData ? (
            <TableBody>
              {apiData.map((item) => (
              <TableRow key={item._id}>
                <TableCell className='font-bold'>{item.name}</TableCell>
                <TableCell className='font-mono text-slate-400'>{item._id}</TableCell>
                <TableCell className='text-center'>{item.port}</TableCell>
                <TableCell className='text-center'>{item.count}</TableCell>
                <TableCell className='flex items-center justify-center'>
                  <Action item={item} onRefresh={handleRefreshClick} />
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


function Action({item, onRefresh}){
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const [serviceName, setServiceName] = useState(item.name || '');
  const [servicePort, setServicePort] = useState(item.port || '');

  const handleEditClick = (onClose) => {
    const payload = { id: item._id,  name: serviceName, port: servicePort};

    fetch('http://localhost:5001/edit/service', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then(response => response.json())
      .then(data => {
        if (onRefresh) {
          onRefresh();
        }
        onClose();
      })
      .catch(error => {
        console.error('Errore nella richiesta di modifica:', error);
      });
  }

  const handleDeleteClick = () => {
    const payload = { id: item._id };

    fetch('http://localhost:5001/delete/service', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then(response => response.json())
      .then(data => {
        if (onRefresh) {
          onRefresh();
        }
      })
      .catch(error => {
        console.error('Errore nella richiesta di eliminazione:', error);
      });
  };

  const handleKeyPress = (event, onClose) => {
    if (event.key === 'Enter') {
      handleEditClick(onClose);
    }
  };

  return(
    <div className="relative flex items-center gap-2">
      <Tooltip content="Edit service">
        <span className="text-lg text-default-400 cursor-pointer active:opacity-50" onClick={onOpen}>
          <EditIcon />
        </span>
      </Tooltip>
      <Tooltip color="danger" content="Delete service">
        <span className="text-lg text-danger cursor-pointer active:opacity-50"  onClick={handleDeleteClick}>
          <DeleteIcon />
        </span>
      </Tooltip>

      <Modal className='dark text-foreground bg-background' isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
        <>
          <ModalHeader className="flex flex-col gap-1">Edit service {item._id}</ModalHeader>
          <ModalBody>
            <Input type="text" label="Seervice name" placeholder={item.name} onChange={(e) => setServiceName(e.target.value)} onKeyDown={(e) => handleKeyPress(e, onClose)} />
            <Input type="text" label="Service port" placeholder={item.port} onChange={(e) => setServicePort(e.target.value)} onKeyDown={(e) => handleKeyPress(e, onClose)} />
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Close
            </Button>
            <Button color="primary" onPress={() => handleEditClick(onClose)}>
              Edit
            </Button>
          </ModalFooter>
        </>
        )}
      </ModalContent>
    </Modal>
    </div>
  )
}


function AddService(){
  return (
    <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
      <Input type="text" label="Seervice name" />
      <Input type="text" label="Service port" />
    </div>
  )
}


export default function ServicesPage(){
  return (
    <div>
      <div className='mt-[3rem] flex justify-center'>
        <div className='w-[50rem]'>
          <ServicesTable />
        </div>
      </div>
      <div className='mt-[3rem] flex justify-center'>
        <div className='w-[20rem]'>
          <AddService />
        </div>
      </div>
    </div>
  )
}