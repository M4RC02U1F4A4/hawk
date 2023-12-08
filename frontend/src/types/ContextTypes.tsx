import { Script } from "./ScriptTypes";
import { Service } from "./ServicesTypes";

export type DataContextType = {
  loadingState: boolean | undefined;
  services: Service[] | undefined;
  scripts: Script[] | undefined;
  servicesFunctions?: [];
};
