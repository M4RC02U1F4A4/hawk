import React, { useState, useEffect } from 'react';
import { useDataContext } from '../context/Data';
import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, User, Chip, Tooltip, getKeyValue} from "@nextui-org/react";
import {EditIcon} from "./icons/EditIcon";
import {DeleteIcon} from "./icons/DeleteIcon";
import {EyeIcon} from "./icons/EyeIcon";

export default function Attacks() {

    const { scriptsData, fetchScripts, attackStatusData } = useDataContext();
    const [loading, setLoading] = useState(true);

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


    if (loading) {
        return (
            <div className='flex justify-center mt-10'>
                <Table removeWrapper className="w-1/2">
                    <TableHeader>
                        <TableColumn>NAME</TableColumn>
                        <TableColumn>ID</TableColumn>
                        <TableColumn>SERVICE</TableColumn>
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
                        <TableColumn>SERVICE</TableColumn>
                        <TableColumn className='text-center'>UPTIME</TableColumn>
                        <TableColumn className='text-center'>STATUS</TableColumn>
                        <TableColumn className='text-center'>ACTIONS</TableColumn>
                    </TableHeader>
                    <TableBody >
                    {scriptsData.map((scripts, index) => (
                            <TableRow key={index}>
                                <TableCell className='font-bold'>{scripts.name}</TableCell>
                                <TableCell className='font-mono'>{scripts._id}</TableCell>
                                <TableCell className='font-mono'>{scripts.service}</TableCell>
                                <TableCell className='font-mono text-center'>{getStatusAndUptimeById(scripts._id)['uptime']}</TableCell>
                                <TableCell className='font-mono text-center'>
                                    {getStatusAndUptimeById(scripts._id)['status'] === "Failed" ? (
                                        <Chip size="sm" variant="flat" color='danger'>{getStatusAndUptimeById(scripts._id)['status']}</Chip>
                                    ) : getStatusAndUptimeById(scripts._id)['status'] === "Success" ? (
                                        <Chip size="sm" variant="flat" color='success'>{getStatusAndUptimeById(scripts._id)['status']}</Chip>
                                    ) : (
                                        <Chip size="sm" variant="flat" color='primary'>{getStatusAndUptimeById(scripts._id)['status']}</Chip>
                                    )}
                                </TableCell>
                                <TableCell className='text-center'>
                                    <div className="relative flex items-center gap-2">
                                        <Tooltip content="Logs">
                                            <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                                                <EyeIcon />
                                            </span>
                                            </Tooltip>
                                            <Tooltip content="Edit user">
                                            <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                                                <EditIcon />
                                            </span>
                                            </Tooltip>
                                            <Tooltip color="danger" content="Delete user">
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
        </>
    )
}
