import { useEffect, useState } from "react";
import NavBar from './components/NavBar';
import Attacks from './Attacks'
import Farm from './Farm'
import Services from './Services'
import Settings from './Settings'

export const Main = () => {

  const [activePage, setActivePage] = useState(localStorage.getItem('activePage') || 'attacks');

  useEffect(() => {
    localStorage.setItem('activePage', activePage);
  }, [activePage]);

  const handleNavLinkClick = (page) => {
    setActivePage(page);
  };

  return (
    <div className='mx-8'>
        <NavBar activePage={activePage} handleNavLinkClick={handleNavLinkClick} />
        <div>
            {activePage === "attacks" && <Attacks />}
            {activePage === "farm" && <Farm />}
            {activePage === "services" && <Services />}
            {activePage === "settings" && <Settings />}
        </div>
    </div>
  );
  
};
