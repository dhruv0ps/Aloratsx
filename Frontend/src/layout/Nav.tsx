import {  Dropdown, Navbar } from "flowbite-react";
import { HiLogout } from "react-icons/hi";
import { MdMenu, MdMenuOpen } from "react-icons/md";
import { observer } from "mobx-react-lite";
import { useStore } from "../store/useStore";
import { useNavigate } from "react-router-dom";
import logo from "../assets/alora.png"

export default observer(function NavBar({ toggleSidebar, isSidebarOpen }: any) {
  const { authStore } = useStore();
  const navigate = useNavigate()
  return (
    <Navbar className="bg-gray-50 drop-shadow-sm" fluid rounded>
      <Navbar.Brand href="/">
        <img src={logo} className=" ml-3 mr-3 h-10" alt="Flowbite React Logo" />
        {/* <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">React App</span> */}

      </Navbar.Brand>
      <div className=" flex items-center md:order-2">
        <Dropdown
          arrowIcon={false}
          inline
          label={
            
<div className="relative w-10 h-10 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-800">
        <svg className="absolute w-12 h-12 text-gray-800 dark:text-gray-100 -left-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
        </svg>
      </div>
          }
        >
          <Dropdown.Header>
            <span className="block text-base font-thin">{authStore?.user?.username ?? "User"}</span>
            <span className="block truncate text-sm">{authStore?.user?.email}</span>
          </Dropdown.Header>
          {/* <Dropdown.Item href="/" icon={HiViewGrid}>Dashboard</Dropdown.Item>
          <Dropdown.Item icon={HiCog}>Settings</Dropdown.Item>
          <Dropdown.Item icon={HiCurrencyDollar}>Earnings</Dropdown.Item> */}
          <Dropdown.Divider />
          <Dropdown.Item icon={HiLogout} onClick={async () => {
            await authStore.logout()
            navigate("/login");
          }}>Sign out</Dropdown.Item>
        </Dropdown>
        {isSidebarOpen ? <MdMenuOpen className="text-2xl mx-2 lg:hidden" onClick={() => toggleSidebar()} /> : <MdMenu className="text-2xl mx-2 lg:hidden" onClick={() => toggleSidebar()} />}
      </div>

    </Navbar>
  );
}
)