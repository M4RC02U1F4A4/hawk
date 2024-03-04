import React, { useState, useEffect } from 'react';
import { useDataContext } from '../context/Data';
import { Modal, useDisclosure, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } from "@nextui-org/react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Tooltip} from "@nextui-org/react";
import {EditIcon} from "./icons/EditIcon";
import {DeleteIcon} from "./icons/DeleteIcon";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import config from "../config";


export default function Services() {

    const { servicesData, fetchServices } = useDataContext();
    const [loading, setLoading] = useState(true);
    const [serviceEdit, setServiceEdit] = useState('');
    const [newServiceName, setNewServiceName]  = useState();
    const [newServicePort, setNewServicePort]  = useState();
    const {isOpen: isOpenEditService, onOpen: onOpenEditService, onOpenChange: onOpenChangeEditService, onClose: onCloseEditService} = useDisclosure();

    useEffect(() => {
        if (servicesData?.length > 0) {
          setLoading(false);
        }
    }, [servicesData]);

    const handleRemoveService = async (id) => {
        try {
            const response = await fetch(`${config.API_BASE_URL}/delete/service`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id })
            });
            const responseData = await response.json();
            if (response.ok && responseData.status === 'OK') {
                fetchServices();
                toast.success(responseData.message);
            } else {
                toast.error(responseData.message || 'Failed to remove service');
            }
        } catch (error) {
            console.error('Error removing service:', error);
            toast.error('API error');
        }
    };

    const handleEditService = async (id, name, port) => {
        setServiceEdit({"id": id, "name": name, "port": port});
        console.log(serviceEdit)
        setNewServiceName(name);
        setNewServicePort(port);
        onOpenEditService();
    };

    const handleUpdateService = async () => {
        if (isNaN(parseInt(newServicePort)) || parseInt(newServicePort) < 0 || parseInt(newServicePort) > 65535) {
            toast.error('Port must be a valid number between 0 and 65535');
            return;
        }

        try {
            const response = await fetch(`${config.API_BASE_URL}/edit/service`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id: serviceEdit.id, name: newServiceName, port: newServicePort })
            });
            const responseData = await response.json();
            if (response.ok && responseData.status === 'OK') {
                fetchServices();
                onCloseEditService();
                toast.success(responseData.message);
            } else {
                toast.error(responseData.message || 'Failed to edit service');
            }
        } catch (error) {
            console.error('Error editing service:', error);
            toast.error('API error');
        }
    }

    const handleKeyPressEdit = (event) => {
        if (event.key === 'Enter') {
            handleUpdateService();
        }
    };

    if (loading) {
        return (
            <>
                <div className='flex justify-center mt-10'>
                    <Table removeWrapper className="w-1/2">
                        <TableHeader>
                            <TableColumn>NAME</TableColumn>
                            <TableColumn>ID</TableColumn>
                            <TableColumn>SCRIPTS</TableColumn>
                            <TableColumn>PORT</TableColumn>
                            <TableColumn>ACTION</TableColumn>
                        </TableHeader>
                        <TableBody emptyContent={"Loading..."}>{[]}</TableBody>
                    </Table>
                </div>
                <AddService />
            </>
        );
    }


    return (
      <>
        <div className="flex justify-center mt-10">
          <Table removeWrapper className="w-1/2">
            <TableHeader>
              <TableColumn>NAME</TableColumn>
              <TableColumn>ID</TableColumn>
              <TableColumn className="text-center">SCRIPTS</TableColumn>
              <TableColumn className="text-center">PORT</TableColumn>
              <TableColumn className="text-center">ACTION</TableColumn>
            </TableHeader>
            <TableBody>
              {servicesData.map((service, index) => (
                <TableRow key={index}>
                  <TableCell className="font-bold">{service.name}</TableCell>
                  <TableCell className="font-mono">{service._id}</TableCell>
                  <TableCell className="font-mono text-center">
                    {service.count}
                  </TableCell>
                  <TableCell className="font-mono text-center">
                    {service.port}
                  </TableCell>
                  {/* <TableCell className='text-center'><Button size="sm" color="danger" variant='ghost' onClick={() => handleRemoveService(service._id)}>Remove</Button></TableCell> */}
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Tooltip content="Edit service">
                        <span className="text-lg cursor-pointer text-default-400 active:opacity-50">
                          <EditIcon
                            onClick={() =>
                              handleEditService(
                                service._id,
                                service.name,
                                service.port
                              )
                            }
                          />
                        </span>
                      </Tooltip>
                      <Tooltip color="danger" content="Delete service">
                        <span className="text-lg cursor-pointer text-danger active:opacity-50">
                          <DeleteIcon
                            onClick={() => handleRemoveService(service._id)}
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
        <AddService />
        <Modal
          isOpen={isOpenEditService}
          onOpenChange={onOpenChangeEditService}
          className="dark text-foreground bg-background"
          backdrop="blur"
          hideCloseButton>
          <ModalContent>
            {(onCloseEditService) => (
              <>
                <ModalHeader>
                  Edit Service {serviceEdit.id} [{serviceEdit.name}]
                </ModalHeader>
                <ModalBody>
                  <Input
                    label="Name"
                    placeholder={serviceEdit.name}
                    onChange={(e) => setNewServiceName(e.target.value)}
                    onKeyDown={(e) => handleKeyPressEdit(e)}
                  />
                  <Input
                    label="Port"
                    placeholder={serviceEdit.port}
                    onChange={(e) => setNewServicePort(e.target.value)}
                    onKeyDown={(e) => handleKeyPressEdit(e)}
                  />
                </ModalBody>
                <ModalFooter>
                  <Button
                    color="danger"
                    variant="light"
                    onPress={onCloseEditService}>
                    {" "}
                    Cancel{" "}
                  </Button>
                  <Button color="primary" onClick={handleUpdateService}>
                    {" "}
                    Edit{" "}
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </>
    );
}

const AddService = () => {

    const { servicesData, fetchServices } = useDataContext();
    const [serviceName, setServiceName] = useState('');
    const [servicePort, setServicePort] = useState('');
    const {isOpen: isOpenAddService, onOpen: onOpenAddService, onOpenChange: onOpenChangeAddService, onClose: onCloseAddService} = useDisclosure();

    const handleAddService = async () => {
        if (isNaN(parseInt(servicePort)) || parseInt(servicePort) < 0 || parseInt(servicePort) > 65535) {
            toast.error('Port must be a valid number between 0 and 65535');
            return;
        }

        try {
            const response = await fetch(`${config.API_BASE_URL}/add/service`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: serviceName, port: servicePort })
            });
            const responseData = await response.json();
            if (response.ok && responseData.status === 'OK') {
                fetchServices();
                onCloseAddService();
                toast.success(responseData.message);
                setServiceName('');
                setServicePort('');
            } else {
                toast.error(responseData.message || 'Failed to add service');
            }
        } catch (error) {
            console.error('Error adding service:', error);
            toast.error('API error');
        }
    };

    const handleKeyPressAdd = (event) => {
        if (event.key === 'Enter') {
            handleAddService();
        }
    };

    return (
      <>
        <div className="flex justify-center mt-10">
          <Button
            className="w-1/2 "
            color="primary"
            variant="ghost"
            fullWidth="true"
            onPress={onOpenAddService}>
            ADD
          </Button>
        </div>
        <Modal
          isOpen={isOpenAddService}
          onOpenChange={onOpenChangeAddService}
          className="dark text-foreground bg-background"
          backdrop="blur"
          hideCloseButton>
          <ModalContent>
            {(onCloseAddService) => (
              <>
                <ModalHeader>Add Service</ModalHeader>
                <ModalBody>
                  <Input
                    label="Service Name"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    onKeyDown={(e) => handleKeyPressAdd(e)}
                  />
                  <Input
                    label="Port"
                    value={servicePort}
                    onChange={(e) => setServicePort(e.target.value)}
                    onKeyDown={(e) => handleKeyPressAdd(e)}
                  />
                </ModalBody>
                <ModalFooter>
                  <Button
                    color="danger"
                    variant="light"
                    onPress={onCloseAddService}>
                    {" "}
                    Cancel{" "}
                  </Button>
                  <Button color="primary" onClick={handleAddService}>
                    {" "}
                    Add{" "}
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </>
    );
}