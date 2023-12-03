import {Navbar, NavbarBrand, NavbarContent, NavbarItem, Link} from "@nextui-org/react";
import React from "react";
import { useLocation } from 'react-router-dom';



const items = [
    {name: "Home", link: "/", isActive: false},
    {name: "Services", link: "/services", isActive: false},
    {name: "Info", link: "/info", isActive: false}]

export function NavBar()   {
    return (
    <Navbar isBordered>
    <NavbarBrand>
        <p className="font-bold text-inherit">HAWK</p>
    </NavbarBrand>
    <NavbarContent className="" justify="center">
        {items.map((item)=>{
        return (<NavbarItem>
            <Link color="foreground" href={item.link} aria-current={item.isActive}>
            {item.name}
            </Link>
        </NavbarItem>)
        })}
    </NavbarContent>
    <NavbarContent justify="end">
        <NavbarItem className="hidden lg:flex">
            <Link href="#">Login</Link>
        </NavbarItem>
    </NavbarContent>
    </Navbar>
    )
}

