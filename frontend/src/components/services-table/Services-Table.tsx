import React from "react";
import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, User, Chip, Tooltip, ChipProps, getKeyValue} from "@nextui-org/react";
import {EditIcon} from "./Edit";
import {DeleteIcon} from "./Delete";
import {EyeIcon} from "./Eye";
import {columns, services} from "./data";

const statusColorMap: Record<string, ChipProps["color"]>  = {
  active: "success",
  paused: "danger",
  vacation: "warning",
};

type Services = typeof services[0];

export default function ServicesTable() {
  const renderCell = React.useCallback((service: Services, columnKey: React.Key) => {
    switch (columnKey) {
      case "name":
        return (
          <p>{service.name}</p>
        );
      case "port":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize text-default-400">{service.port}</p>
          </div>
        );
      case "actions":
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="Details">
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
        );
    }
  }, []);

  return (
  <Table aria-label="Example table with custom cells">
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
            {column.name}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody items={services}>
        {(item) => (
          <TableRow key={item._id}>
            {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
