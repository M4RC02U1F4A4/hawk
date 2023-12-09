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
import { Service } from "../types/ServicesTypes";
import { toast } from "react-toastify";

export default function ServicesPage() {
  const context = useContext(DataContext);
  const services = context?.services;
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedService, setSelectedService] = useState<Service>();
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
      <ServiceModal item={selectedService} />
    </>
  );

  function ServiceModal(props: { item?: Service }) {
    const [newServiceName, setNewServiceName] = useState<string>();
    const [newPort, setNewPort] = useState<number>();
    const handleEditClick = (onClose: Function) => {
      console.log("SelectedService =>", selectedService);
      console.log("New Data =>", newServiceName, newPort);

      context?.servicesFunctions
        ?.editServiceAPI({
          _id: selectedService?._id,
          name: newServiceName ? newServiceName : selectedService?.name,
          port: newPort ? newPort : selectedService?.port,
        })
        .then(() => {
          onClose();
          toast.success("Success!");
        });
    };

    return (
      <Modal
        className="dark text-foreground bg-background"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        backdrop="blur"
        hideCloseButton={true}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Edit service {props.item?._id}
              </ModalHeader>
              <ModalBody>
                <Input
                  type="text"
                  label="Service name"
                  placeholder={props.item?.name}
                  onChange={(e) => setNewServiceName(e.target.value)}
                />
                <Input
                  type="number"
                  label="Service port"
                  placeholder={String(props.item?.port)}
                  onChange={(e) => setNewPort(Number(e.target.value))}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  onClick={() => handleEditClick(onClose)}
                  color="primary"
                >
                  Edit
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    );
  }

  function ServicesTable() {
    return (
      <Table>
        <TableHeader>
          <TableColumn className="text-base">NAME</TableColumn>
          <TableColumn className="text-base">ID</TableColumn>
          <TableColumn className="text-base text-center">PORT</TableColumn>
          <TableColumn className="text-base text-center">N SCRIPT</TableColumn>
          <TableColumn className="text-base text-center">ACTIONS</TableColumn>
        </TableHeader>
        {services ? (
          services.length == 0 ? (
            <TableBody emptyContent={"No services provided"}>{[]}</TableBody>
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
                    <TableCell className="text-center">
                      {service.count}
                    </TableCell>
                    <TableCell className="flex items-center justify-center">
                      <Action
                        _id={service._id}
                        name={service.name}
                        port={service.port}
                        count={service.count}
                      />
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

  function Action(item: Service) {
    return (
      <div className="relative flex items-center gap-2">
        <Tooltip content="Edit service">
          <span
            onClick={() => {
              setSelectedService(item);
              onOpen();
            }}
            className="text-lg cursor-pointer text-default-400 active:opacity-50"
          >
            <EditIcon />
          </span>
        </Tooltip>
        <Tooltip color="danger" content="Delete service">
          <span
            onClick={() => {
              item
                ? context?.servicesFunctions?.deleteServiceAPI(item)
                : toast.error("No selected service");
            }}
            className="text-lg cursor-pointer text-danger active:opacity-50"
          >
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




