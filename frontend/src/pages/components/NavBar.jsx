import React from "react";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link } from "@nextui-org/react";

export default function NavBar({ activePage, handleNavLinkClick }) {

    return (
        <>
        <Navbar>
            <NavbarBrand>
                <a className="font-bold text-inherit" href="/" >HAWK</a>
            </NavbarBrand>
            <NavbarContent className="sm:flex gap-4" justify="center">
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
                    <Link className="cursor-pointer" color={activePage === "settings" ? "primary" : "foreground"} onClick={() => handleNavLinkClick("settings")}>
                        Settings
                    </Link>
                </NavbarItem>
            </NavbarContent>
        </Navbar>
        </>
    )
}