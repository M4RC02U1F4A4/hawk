import React, { useState, useEffect } from 'react';
import {Modal, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Tooltip, useDisclosure, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input} from "@nextui-org/react";


export default function ServicesPage() {
    return (
    <>
        Services
        <ServicesTable />
    </>
    )
}

function ServicesTable() {
    return (
      <Table className='mx-auto max-w-4xl mt-10'>
        <TableHeader>
          <TableColumn className='text-base'>NAME</TableColumn>
          <TableColumn className='text-base'>ID</TableColumn>
          <TableColumn className='text-base text-center'>PORT</TableColumn>
          <TableColumn className='text-base text-center'>SCRIPTS</TableColumn>
          <TableColumn className='text-base text-center'>ACTIONS</TableColumn>
        </TableHeader>
        {/* {apiData ? (
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
          ))} */}
        <TableBody>
            <TableRow key={1}>
                <TableCell className='font-bold'>{"PIPPO"}</TableCell>
              <TableCell className='font-mono text-slate-400'>{"id_10203403"}</TableCell>
              <TableCell className='text-center'>{"443"}</TableCell>
              <TableCell className='text-center'>{"Script"}</TableCell>
              <TableCell className='flex items-center justify-center'>
                Buttons
              </TableCell>
            </TableRow>
        </TableBody>
      </Table>
)
}