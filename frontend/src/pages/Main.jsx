import { useEffect, useState } from "react";
import NavBar from './components/NavBar';
import Attacks from './Attacks'
import Farm from './Farm'
import Services from './Services'
import { ToastContainer, Zoom } from 'react-toastify';

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
        </div>
        <ToastContainer closeButton={false} position="bottom-right" autoClose={2500} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable={false} pauseOnHover={false} theme="dark" transition={Zoom} />
    </div>
  );
  
};
