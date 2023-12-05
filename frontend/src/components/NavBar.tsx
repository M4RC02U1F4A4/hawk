import {Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button} from "@nextui-org/react";
import React from "react";



const items = [{name: "Home", link: "/", isActive: false},{name: "Services", link: "/services", isActive: false},{name: "Info", link: "/info", isActive: false}]

export function NavBar()   {
    return (<Navbar isBordered>
        <NavbarBrand>
            <p className="font-bold text-inherit">HAWK</p>
        </NavbarBrand>
        <NavbarContent className="" justify="center">
        {items.map((item, index)=>{
                    return (<NavbarItem key={index}>
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
            <NavbarItem>
            <Button as={Link} color="primary" href="#" variant="flat">
                Sign Up
            </Button>
            </NavbarItem>
        </NavbarContent>
        </Navbar>)
}

