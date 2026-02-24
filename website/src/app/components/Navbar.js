"use client"

import React from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Navbar,
  MobileNav,
  Typography,
  Button,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
  Card,
  IconButton,
} from "@material-tailwind/react";
import {
  CubeTransparentIcon,
  UserCircleIcon,
  CodeBracketSquareIcon,
  Square3Stack3DIcon,
  ChevronDownIcon,

  PowerIcon,
  RocketLaunchIcon,
  Bars2Icon,
  HomeIcon,
  ChatBubbleLeftRightIcon,
  BookOpenIcon,
} from "@heroicons/react/24/solid";

import { signOut } from "next-auth/react";
import Home from "../dashboard/page";
 
// profile menu component
const profileMenuItems = [
  {
    label: "Sign Out",
    icon: PowerIcon,
    onClick: handleSignOut,
    
  },
];

function handleSignOut() {
  signOut(); 
}
 
function ProfileMenu() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const closeMenu = () => setIsMenuOpen(false);
  const { status, data: session } = useSession();
  function handleSignOutClick() {
    signOut({ callbackUrl: '/login' });
    closeMenu();
  }
 
  return (
    <Menu open={isMenuOpen} handler={setIsMenuOpen} placement="bottom-end">
      <MenuHandler>
        <Button
          variant="text"
          color="pink"
          className="flex items-center gap-1 rounded-full py-0.5 pr-2 pl-0.5 lg:ml-auto"
        >
          <Image
      className="rounded-full border border-gray-900 p-0.5"
        src={session?.user?.image}
        alt={session?.user?.name}
        width={40}
        height={40}

       />
          <ChevronDownIcon
            strokeWidth={2.5}
            className={`h-3 w-3 transition-transform ${
              isMenuOpen ? "rotate-180" : ""
            }`}
          />
          
        </Button>
      </MenuHandler>
      <MenuList className="p-1">
        {profileMenuItems.map(({ label, icon }, key) => {
          const isLastItem = key === profileMenuItems.length - 1;
          return (
            <MenuItem
              key={label}
              onClick={() => handleSignOutClick()}
              className={`flex items-center gap-2 rounded ${
                isLastItem
                  ? "hover:bg-red-500/10 focus:bg-red-500/10 active:bg-red-500/10"
                  : ""
              }`}
            >
              {React.createElement(icon, {
                className: `h-4 w-4 ${isLastItem ? "text-red-500" : ""}`,
                strokeWidth: 2,
              })}
              <Typography
                as="span"
                variant="small"
                className="font-normal"
                color={isLastItem ? "red" : "inherit"}
              >
                {label}
              </Typography>
            </MenuItem>
          );
        })}
      </MenuList>
    </Menu>
  );
}
 
// nav list menu

// nav list component
const navListItems = [
  {
    label: "Home",
    icon: HomeIcon,
    redirectTo: "/dashboard",
  },
  {
    label: "Discussion Forum",
    icon: ChatBubbleLeftRightIcon,
    redirectTo: "/discussions",
  },
  {
    label: "Blogs",
    icon: BookOpenIcon,
    redirectTo: "/learnheart",
  },
  {
    label:"AI Planner",
    icon: CubeTransparentIcon,
    redirectTo: "/ai-planner",
  }
];
 
function NavList() {
  return (
    <ul className="mt-2 mb-4 flex flex-col gap-2 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center justify-center px-[10vw]">
      {navListItems.map(({ label, icon,redirectTo}, key) => (
        <Typography
          key={label}
          as="a"
          href={redirectTo}
          variant="small"
          color="gray"
          className="font-medium"
        >
          <MenuItem className="flex items-center gap-2 lg:rounded-full">
            {React.createElement(icon, { className: "h-[18px] w-[18px]" })}{" "}
            <span className="text-gray-900"> {label}</span>
          </MenuItem>
        </Typography>
      ))}
    </ul>
  );
}
 
export default function ComplexNavbar() {
  const [isNavOpen, setIsNavOpen] = React.useState(false);
 
  const toggleIsNavOpen = () => setIsNavOpen((cur) => !cur);
 
  React.useEffect(() => {
    window.addEventListener(
      "resize",
      () => window.innerWidth >= 960 && setIsNavOpen(false),
    );
  }, []);
 
  return (
<Navbar className="mx-auto max-w-screen-xl p-2 lg:rounded-full lg:pl-6 bg-pink-50 bg-opacity-100 mt-6 sticky top-2 z-50">
      <div className=" mx-auto flex items-center justify-between text-pink-500">
        <Typography
          as="a"
          href="/"
          className="mr-4 ml-2 cursor-pointer py-1.5 font-bold text-2xl tracking-tight leading-tight inline-block whitespace-nowrap"
        >
          Heart Health
        </Typography>
        <div className="hidden lg:block">
          <NavList />
        </div>
        <IconButton
          size="sm"
          color="pink"
          variant="text"
          onClick={toggleIsNavOpen}
          className="ml-auto mr-2 lg:hidden"
        >
          <Bars2Icon className="h-6 w-6" />
        </IconButton>
        <ProfileMenu />
      </div>
      <MobileNav open={isNavOpen} className="overflow-scroll">
        <NavList />
      </MobileNav>
      
    </Navbar>
  );
}