import React, { useContext } from "react";
import { ContextData } from "../../pages/services";
const columns = [
  {name: "NAME", uid: "name"},
  {name: "PORT", uid: "port"},
  {name: "ACTIONS", uid: "actions"},
];



var services = [
    {
        "_id": "1",
        "name": "Service 1",
        "port": 8080
      }
];






export {columns, services};
