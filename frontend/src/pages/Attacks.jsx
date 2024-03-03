import React, { useState, useEffect } from 'react';
import { useDataContext } from '../context/Data';
import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Tooltip} from "@nextui-org/react";
import { Modal, useDisclosure, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } from "@nextui-org/react";
import {Select, SelectItem} from "@nextui-org/react";

import {EditIcon} from "./icons/EditIcon";
import {DeleteIcon} from "./icons/DeleteIcon";
import {EyeIcon} from "./icons/EyeIcon";

export default function Attacks() {

    const { scriptsData, fetchScripts, attackStatusData, servicesData } = useDataContext();
    const [loading, setLoading] = useState(true);
    const {isOpen: isOpenAddScript, onOpen: onOpenAddScript, onOpenChange: onOpenChangeAddScript, onClose: onCloseAddScript} = useDisclosure();

    useEffect(() => {
        if (scriptsData.length > 0 && attackStatusData.length > 0) {
            setLoading(false);
        }
    }, [scriptsData, attackStatusData]);

    function formatUptime(uptimeInSeconds) {
        const hours = Math.floor(uptimeInSeconds / 3600);
        const minutes = Math.floor((uptimeInSeconds % 3600) / 60);
        const seconds = Math.floor(uptimeInSeconds % 60);
        return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
    }

    function getStatusAndUptimeById(id) {;
        for (const item of attackStatusData) {
            if (item.name.includes(id)) {
                return {
                    status: item.phase,
                    uptime: formatUptime(item.uptime)
                };
            }
        }
        return {
            status: "NA",
            uptime: "NA"
        };
    }

    function getServiceName(id) {;
        for (const item of servicesData) {
            if (item._id.includes(id)) {
                return item.name;
            }
        }
    }


    if (loading) {
        return (
            <div className='flex justify-center mt-10'>
                <Table removeWrapper className="w-1/2">
                    <TableHeader>
                        <TableColumn>NAME</TableColumn>
                        <TableColumn>ID</TableColumn>
                        <TableColumn>SERVICE</TableColumn>
                        <TableColumn>FLAGS</TableColumn>
                        <TableColumn>UPTIME</TableColumn>
                        <TableColumn>STATUS</TableColumn>
                        <TableColumn>ACTIONS</TableColumn>
                    </TableHeader>
                    <TableBody emptyContent={"Loading..."}>{[]}</TableBody>
                </Table>
            </div>
        );
    }


    return (
        <>
            <div className='flex justify-center mt-10'>
                <Table removeWrapper>
                    <TableHeader>
                    <TableColumn>NAME</TableColumn>
                        <TableColumn>ID</TableColumn>
                        <TableColumn>SERVICE NAME</TableColumn>
                        <TableColumn>SERVICE ID</TableColumn>
                        <TableColumn className='text-center'>FLAGS</TableColumn>
                        <TableColumn className='text-center'>UPTIME</TableColumn>
                        <TableColumn className='text-center'>STATUS</TableColumn>
                        <TableColumn className='text-center'>ATTACK</TableColumn>
                        <TableColumn className='text-center'>ACTIONS</TableColumn>
                    </TableHeader>
                    <TableBody >
                    {scriptsData.map((scripts, index) => (
                            <TableRow key={index}>
                                <TableCell className='font-bold'>{scripts.name}</TableCell>
                                <TableCell className='font-mono'>{scripts._id}</TableCell>
                                <TableCell className='font-mono'>{getServiceName(scripts.service)}</TableCell>
                                <TableCell className='font-mono'>{scripts.service}</TableCell>
                                <TableCell className='font-mono text-center'>N of FLAGS</TableCell>
                                <TableCell className='font-mono text-center'>{getStatusAndUptimeById(scripts._id)['uptime']}</TableCell>
                                <TableCell className='font-mono text-center'>
                                    {getStatusAndUptimeById(scripts._id)['status'] === "Failed" ? (
                                        <Chip size="sm" variant="dot" color='danger'>{getStatusAndUptimeById(scripts._id)['status']}</Chip>
                                    ) : getStatusAndUptimeById(scripts._id)['status'] === "Success" ? (
                                        <Chip size="sm" variant="dot" color='success'>{getStatusAndUptimeById(scripts._id)['status']}</Chip>
                                    ) : (
                                        <Chip size="sm" variant="dot" color='primary'>{getStatusAndUptimeById(scripts._id)['status']}</Chip>
                                    )}
                                </TableCell>
                                <TableCell className='font-mono text-center '>
                                    {getStatusAndUptimeById(scripts._id)['status'] === "Failed" ? (
                                        <Button fullWidth size="sm" color="warning" variant='ghost' >RESTART</Button>
                                    ) : getStatusAndUptimeById(scripts._id)['status'] === "Success" ? (
                                        <Button fullWidth size="sm" color="danger" variant='ghost' >STOP</Button>
                                    ) : (
                                        <Button fullWidth size="sm" color="primary" variant='ghost' >START</Button>
                                    )}
                                </TableCell>
                                <TableCell className='text-center'>
                                    <div className="flex justify-center items-center gap-2">
                                        <Tooltip content="Logs">
                                            <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                                                <EyeIcon />
                                            </span>
                                            </Tooltip>
                                            <Tooltip content="Edit script">
                                            <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                                                <EditIcon />
                                            </span>
                                            </Tooltip>
                                            <Tooltip color="danger" content="Delete script">
                                            <span className="text-lg text-danger cursor-pointer active:opacity-50">
                                                <DeleteIcon />
                                            </span>
                                        </Tooltip>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className='flex justify-center mt-10'>
                    <Button className=" w-1/2" color="primary" variant='ghost' fullWidth="true" onPress={onOpenAddScript}>ADD</Button>
                    <Modal isOpen={isOpenAddScript} onOpenChange={onOpenChangeAddScript} className="dark text-foreground bg-background" backdrop="blur" hideCloseButton>
                        <ModalContent>
                        {(onCloseAddScript) => (
                            <>
                                <ModalHeader>Add Attack</ModalHeader>
                                <ModalBody>
                                    <Input label="Attack Name"/>
                                    <Select label="Service" className="max-w-xs" >
                                        {servicesData.map((service) => (
                                        <SelectItem key={service.name} value={service.name}>
                                            {service.name}
                                        </SelectItem>
                                        ))}
                                    </Select>
                                </ModalBody>
                                <ModalFooter>
                                    <Button color="danger" variant="light" onPress={onCloseAddScript}> Cancel </Button>
                                    <Button color='primary'> Add </Button>
                                </ModalFooter>
                            </>
                        )}
                        </ModalContent>
                    </Modal>
                </div>
        </>
    )
}
