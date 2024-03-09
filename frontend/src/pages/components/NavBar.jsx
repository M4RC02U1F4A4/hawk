import React, { useState, useEffect } from 'react';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link } from "@nextui-org/react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@nextui-org/react";
import { Input } from "@nextui-org/react";
import { useDataContext } from '../../context/Data';
import config from "../../config";
import { ToastContainer, toast, Zoom } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Spinner } from "@nextui-org/react";

export default function NavBar({ activePage, handleNavLinkClick }) {
  const [loading, setLoading] = useState(false);
  const { startupData, fetchStartup } = useDataContext();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [loadingStartup, setLoadingStartup] = useState(true);
  const [flagRegex, setFlagRegex] = useState("");
  const [ipRange, setIpRange] = useState("");
  const [myIp, setMyIp] = useState("");
  const [farmSleep, setFarmSleep] = useState("");

  useEffect(() => {
    if (startupData && Object.keys(startupData).length > 0) {
      setLoadingStartup(false);
      setFlagRegex(startupData.flag_regex);
      setIpRange(startupData.ip_range);
      setMyIp(startupData.my_ip);
      setFarmSleep(startupData.farm_sleep);
    }
  }, [startupData]);

  const handleSaveSettings = async () => {
    let flagRegexToSend = flagRegex;
    let ipRangeToSend = ipRange;
    let myIpToSend = myIp;
    let farmSleepToSend = farmSleep;

    if (!flagRegex) {
      flagRegexToSend = startupData.flag_regex;
    }
    if (!ipRange) {
      ipRangeToSend = startupData.ip_range;
    }
    if (!myIp) {
      myIpToSend = startupData.my_ip;
    }
    if (!farmSleep) {
      farmSleepToSend = startupData.farm_sleep;
    }

    const payload = {
      flag_regex: flagRegexToSend,
      ip_range: ipRangeToSend,
      my_ip: myIpToSend,
      farm_sleep: farmSleepToSend,
    };

    try {
      const response = await fetch(`${config.API_BASE_URL}/startup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const responseData = await response.json();
      if (response.ok && responseData.status === "OK") {
        onClose();
        fetchStartup();
        toast.success(responseData.message);
      } else {
        toast.error(responseData.message || "Failed update settings.");
      }
    } catch (error) {
      console.error("Error while saving settings:", error.message);
      toast.error("API error");
    }
  };

  const handleKeyPressEdit = (event) => {
    if (event.key === "Enter") {
      handleSaveSettings();
    }
  };
  const handleSettings = async () => {
    await fetchStartup();
    setLoading(false);
    console.log("Done");
  };
  return (
    <>
      <Navbar maxWidth="full" isBordered>
        <NavbarBrand className="m-0">
          <a className="font-bold text-inherit" href="/">
            {" "}
            HAWK{" "}
          </a>
          <NavbarContent className="ml-10" justify="start">
            <NavbarItem isActive={activePage === "attacks"}>
              <Link
                className="cursor-pointer"
                color={activePage === "attacks" ? "primary" : "foreground"}
                onClick={() => handleNavLinkClick("attacks")}>
                {" "}
                Attacks{" "}
              </Link>
            </NavbarItem>
            <NavbarItem isActive={activePage === "farm"}>
              <Link
                className="cursor-pointer"
                color={activePage === "farm" ? "primary" : "foreground"}
                onClick={() => handleNavLinkClick("farm")}>
                {" "}
                Farm{" "}
              </Link>
            </NavbarItem>
            <NavbarItem isActive={activePage === "services"}>
              <Link
                className="cursor-pointer"
                color={activePage === "services" ? "primary" : "foreground"}
                onClick={() => handleNavLinkClick("services")}>
                {" "}
                Services{" "}
              </Link>
            </NavbarItem>
          </NavbarContent>
        </NavbarBrand>
        <NavbarContent justify="end">
          <NavbarItem isActive={activePage === "settings"}>
            <Button
              className="antialiased font-semibold"
              color="primary"
              variant="ghost"
              onPress={() => {
                onOpen();
                setLoading(true);
                handleSettings();
              }}>
              {" "}
              Settings{" "}
            </Button>
          </NavbarItem>
        </NavbarContent>
      </Navbar>

      <Modal
        size="4xl"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        className="dark text-foreground bg-background"
        backdrop="blur"
        hideCloseButton>
        <ModalContent>
          {(onClose) =>
            loading ? (
              <Spinner className="my-20" />
            ) : (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Settings
                </ModalHeader>
                <ModalBody>
                  <div className="flex flex-wrap w-full gap-4 md:flex-nowrap">
                    <Input
                      type="text"
                      label="Flag regex"
                      placeholder={loadingStartup ? "" : startupData.flag_regex}
                      onChange={(e) => setFlagRegex(e.target.value)}
                      onKeyDown={(e) => handleKeyPressEdit(e)}
                    />
                  </div>
                  <div className="flex flex-wrap w-full gap-4 md:flex-nowrap">
                    <Input
                      type="text"
                      label="IP Range"
                      placeholder={loadingStartup ? "" : startupData.ip_range}
                      onChange={(e) => setIpRange(e.target.value)}
                      onKeyDown={(e) => handleKeyPressEdit(e)}
                    />
                    <Input
                      type="text"
                      label="Team IP"
                      placeholder={loadingStartup ? "" : startupData.my_ip}
                      onChange={(e) => setMyIp(e.target.value)}
                      onKeyDown={(e) => handleKeyPressEdit(e)}
                    />
                  </div>
                  <div>
                    <Input
                      type="text"
                      label="Farm sleep"
                      placeholder={loadingStartup ? "" : startupData.farm_sleep}
                      onChange={(e) => setFarmSleep(e.target.value)}
                      onKeyDown={(e) => handleKeyPressEdit(e)}
                    />
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
            )
          }
        </ModalContent>
      </Modal>
    </>
  );
}