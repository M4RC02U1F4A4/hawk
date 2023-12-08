import React, { useState, useEffect, useContext, ContextType } from "react";
import {
  Modal,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
  useDisclosure,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Accordion,
  Spinner,
} from "@nextui-org/react";
import { EditIcon } from "../icons/EditIcon";
import { DeleteIcon } from "../icons/DeleteIcon";
import { PlusIcon } from "../icons/PlusIcon";
import { DataContext } from "../contexts/DataContextProvider";

export default function ServicesPage() {
  const services = useContext(DataContext)?.services;

  return (
    <>
      <h1 className="m-5 text-2xl font-bold">Services List</h1>
      <div className="flex flex-col max-w-3xl gap-4 mx-auto">
        <div className="flex items-end justify-between gap-3">
          <h1>N of Services: {services?.length}</h1>
          <Button color="primary" endContent={<PlusIcon />}>
            Add Service
          </Button>
        </div>
        <ServicesTable />
      </div>
    </>
  );

  function ServicesTable() {
    return (
      <Table>
        <TableHeader>
          <TableColumn className="text-base">NAME</TableColumn>
          <TableColumn className="text-base">ID</TableColumn>
          <TableColumn className="text-base text-center">PORT</TableColumn>
          <TableColumn className="text-base text-center">STATE</TableColumn>
          <TableColumn className="text-base text-center">ACTIONS</TableColumn>
        </TableHeader>
        {services ? (
          services.length == 0 ? (
            <TableBody emptyContent={"No services providen."}>{[]}</TableBody>
          ) : (
            <TableBody>
              {services.map((service) => {
                return (
                  <TableRow key={service._id}>
                    <TableCell className="font-bold">{service.name}</TableCell>
                    <TableCell className="font-mono text-slate-400">
                      {service._id}
                    </TableCell>
                    <TableCell className="text-center">
                      {service.port}
                    </TableCell>
                    <TableCell className="text-center">{"STATE"}</TableCell>
                    <TableCell className="flex items-center justify-center">
                      <Action />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          )
        ) : (
          <TableBody emptyContent={<Spinner />}>{[]}</TableBody>
        )}
      </Table>
    );
  }

  function Action() {
    return (
      <div className="relative flex items-center gap-2">
        <Tooltip content="Edit service">
          <span className="text-lg cursor-pointer text-default-400 active:opacity-50">
            <EditIcon />
          </span>
        </Tooltip>
        <Tooltip color="danger" content="Delete service">
          <span className="text-lg cursor-pointer text-danger active:opacity-50">
            <DeleteIcon />
          </span>
        </Tooltip>
      </div>
    );
  }
  function AddService() {
    return (
      <div className="flex flex-wrap w-full gap-4 md:flex-nowrap">
        <Input type="text" label="Seervice name" />
        <Input type="text" label="Service port" />
      </div>
    );
  }
}


