import { useEffect, useState } from "react";
import NavBar from './components/NavBar';
import Attacks from './Attacks'
import Farm from './Farm'
import Services from './Services'

import { useDataContext } from "../context/Data";
import { Spinner } from "@nextui-org/react";

export const Main = () => {
  const { mainLoading, activePage, setActivePage } = useDataContext();

  useEffect(() => {
    localStorage.setItem("activePage", activePage);
  }, [activePage]);

  const handleNavLinkClick = (page) => {
    setActivePage(page);
  };

  return (
    <>
      {mainLoading ? (
        <div className="flex justify-center h-screen">
          <Spinner />
        </div>
      ) : (
        <div>
          <NavBar
            activePage={activePage}
            handleNavLinkClick={handleNavLinkClick}
          />
          <div>
            {activePage === "attacks" && <Attacks />}
            {activePage === "farm" && <Farm />}
            {activePage === "services" && <Services />}
          </div>
        </div>
      )}
    </>
  );
};
