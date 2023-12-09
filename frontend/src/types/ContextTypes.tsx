import { Script } from "./ScriptTypes";
import { Service } from "./ServicesTypes";

export type DataContextType = {
  loadingState: boolean | undefined;
  services: Service[] | undefined;
  scripts: Script[] | undefined;
  servicesFunctions?: {
    addServiceAPI: (service: Service) => Promise<void>;
    editServiceAPI: (service: Service) => Promise<boolean>;
    deleteServiceAPI: (service: Service) => Promise<void>;
    getServicesAPI: () => void;
  };
};
