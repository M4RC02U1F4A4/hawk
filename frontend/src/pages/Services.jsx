import React, { useState, useEffect } from 'react';
import { useDataContext } from '../context/Data';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react";
import {Button} from "@nextui-org/react";

export default function Services() {

    const { servicesData } = useDataContext();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (servicesData.length > 0) {
            setLoading(false);
        }
    }, [servicesData]);

    if (loading) {
        return (
            <div className='flex justify-center mt-10'>
                <Table removeWrapper className="w-1/2">
                    <TableHeader>
                        <TableColumn>NAME</TableColumn>
                        <TableColumn>ID</TableColumn>
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
                        <TableColumn className='text-center'>PORT</TableColumn>
                        <TableColumn className='text-center'>ACTION</TableColumn>
                    </TableHeader>
                    <TableBody>
                        {servicesData.map((service, index) => (
                            <TableRow key={index}>
                                <TableCell className='font-bold'>{service.name}</TableCell>
                                <TableCell className='font-mono'>{service._id}</TableCell>
                                <TableCell className='font-mono text-center'>{service.port}</TableCell>
                                <TableCell className='text-center'><Button color="danger" variant='ghost'>Remove</Button></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </>
    )
}


{

}