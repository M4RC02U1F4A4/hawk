import React, { useState, useEffect } from 'react';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link } from "@nextui-org/react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@nextui-org/react";
import { Input } from "@nextui-org/react";
import { useDataContext } from '../../context/Data';
import config from "../../config";
import { ToastContainer, toast, Zoom } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function NavBar({ activePage, handleNavLinkClick }) {

    const { startupData, fetchStartup } = useDataContext();
    const {isOpen, onOpen, onOpenChange, onClose} = useDisclosure();
    const [loadingStartup, setLoadingStartup] = useState(true);
    const [flagRegex, setFlagRegex] = useState();
    const [ipRange, setIpRange] = useState();
    const [myIp, setMyIp] = useState();

    useEffect(() => {
        if (startupData.length > 0) {
            setLoadingStartup(false);
            setFlagRegex(startupData.flag_regex);
            setIpRange(startupData.ip_range);
            setMyIp(startupData.my_ip);
        }
    }, [startupData]);

    const handleSaveSettings = async () => {
        let flagRegexToSend = flagRegex;
        let ipRangeToSend = ipRange;
        let myIpToSend = myIp;

        // Check if input fields are empty, if so, use previous values
        if (!flagRegex) {
            flagRegexToSend = startupData.flag_regex;
        }
        if (!ipRange) {
            ipRangeToSend = startupData.ip_range;
        }
        if (!myIp) {
            myIpToSend = startupData.my_ip;
        }
        
        const payload = {
            flag_regex: flagRegexToSend,
            ip_range: ipRangeToSend,
            my_ip: myIpToSend
        };

        try {
            const response = await fetch(`${config.API_BASE_URL}/startup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            const responseData = await response.json();
            if (response.ok && responseData.status === 'OK') {
                onClose();
                fetchStartup();
                toast.success(responseData.message);
            } else {
                toast.error(responseData.message || 'Failed to add service');
            }
        } catch (error) {
            console.error('Error while saving settings:', error.message);
            toast.error('API error');
        }
    };

    return (
        <>
        <Navbar maxWidth="full">
            <NavbarBrand>
                <a className="font-bold text-inherit" href="/" >HAWK</a>
            </NavbarBrand>
            <NavbarContent className="sm:bassis-full gap-4" justify='center'>
                <NavbarItem isActive={activePage === "attacks"}>
                    <Link className="cursor-pointer" color={activePage === "attacks" ? "primary" : "foreground"} onClick={() => handleNavLinkClick("attacks")}>
                        Attacks
                    </Link>
                </NavbarItem>
                <NavbarItem isActive={activePage === "farm"}>
                    <Link className="cursor-pointer" color={activePage === "farm" ? "primary" : "foreground"} onClick={() => handleNavLinkClick("farm")}>
                        Farm
                    </Link>
                </NavbarItem>
                <NavbarItem isActive={activePage === "services"}>
                    <Link className="cursor-pointer" color={activePage === "services" ? "primary" : "foreground"} onClick={() => handleNavLinkClick("services")}>
                        Services
                    </Link>
                </NavbarItem>
            </NavbarContent>
            <NavbarContent justify="end">
                <NavbarItem isActive={activePage === "settings"}>
                <Button className="antialiased font-semibold" color="primary" variant="ghost" onPress={onOpen}> Settings </Button>
                </NavbarItem>
            </NavbarContent>
        </Navbar>
        <Modal size="4xl" isOpen={isOpen} onOpenChange={onOpenChange} className="dark text-foreground bg-background" backdrop="blur" hideCloseButton>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Settings</ModalHeader>
              <ModalBody>
                <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
                    <Input type="text" label="Flag regex" placeholder={loadingStartup ? startupData.flag_regex : ""} onChange={(e) => setFlagRegex(e.target.value)}/>
                </div>
                <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
                    <Input type="text" label="IP Range" placeholder={loadingStartup ? startupData.ip_range : ""} onChange={(e) => setIpRange(e.target.value)}/>
                    <Input type="text" label="Team IP" placeholder={loadingStartup ? startupData.my_ip : ""} onChange={(e) => setMyIp(e.target.value)}/>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={handleSaveSettings}>
                  Save
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
        </>
    )
}