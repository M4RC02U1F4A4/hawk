import React, { useState, useEffect } from 'react';
import { useDataContext } from '../context/Data';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react";
import { Modal, useDisclosure, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } from "@nextui-org/react";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import config from "../config";


export default function Services() {

    const { servicesData, fetchServices } = useDataContext();
    const [loading, setLoading] = useState(true);
    const [serviceName, setServiceName] = useState('');
    const [servicePort, setServicePort] = useState('');
    const {isOpen, onOpen, onOpenChange, onClose} = useDisclosure();

    useEffect(() => {
        if (servicesData.length > 0) {
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
                onClose();
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

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleAddService();
        }
    };

    if (loading) {
        return (
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
        );
    }


    return (
        <>
            <div className='flex justify-center mt-10'>
                <Table removeWrapper className="w-1/2">
                    <TableHeader>
                        <TableColumn>NAME</TableColumn>
                        <TableColumn>ID</TableColumn>
                        <TableColumn className='text-center'>SCRIPTS</TableColumn>
                        <TableColumn className='text-center'>PORT</TableColumn>
                        <TableColumn className='text-center'>ACTION</TableColumn>
                    </TableHeader>
                    <TableBody>
                        {servicesData.map((service, index) => (
                            <TableRow key={index}>
                                <TableCell className='font-bold'>{service.name}</TableCell>
                                <TableCell className='font-mono'>{service._id}</TableCell>
                                <TableCell className='font-mono text-center'>{service.count}</TableCell>
                                <TableCell className='font-mono text-center'>{service.port}</TableCell>
                                <TableCell className='text-center'><Button color="danger" variant='ghost' onClick={() => handleRemoveService(service._id)}>Remove</Button></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className='flex justify-center mt-10'>
                <Button className=" w-1/2" color="primary" variant='ghost' fullWidth="true" onPress={onOpen}>ADD</Button>
            </div>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} className="dark text-foreground bg-background" backdrop="blur" hideCloseButton>
                <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>Add Service</ModalHeader>
                        <ModalBody>
                            <Input label="Service Name" value={serviceName} onChange={(e) => setServiceName(e.target.value)} onKeyDown={(e) => handleKeyPress(e)}/>
                            <Input label="Port" value={servicePort} onChange={(e) => setServicePort(e.target.value)} onKeyDown={(e) => handleKeyPress(e)}/>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="light" onPress={onClose}> Cancel </Button>
                            <Button color='primary' onClick={handleAddService}> Add </Button>
                        </ModalFooter>
                    </>
                )}
                </ModalContent>
            </Modal>
        </>
    )
}