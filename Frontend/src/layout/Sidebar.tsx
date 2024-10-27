import { Sidebar } from "flowbite-react";
import { BiBuoy } from "react-icons/bi";
import { BsBarChartFill, BsIncognito } from "react-icons/bs";
import { FaShoppingCart, FaFileInvoice, FaMoneyBillWave, FaWarehouse, FaUserTie, FaBoxes } from "react-icons/fa";
import { HiChartPie, HiOutlineMinusSm, HiOutlinePlusSm, HiShoppingBag } from "react-icons/hi";
import { MdManageAccounts } from "react-icons/md";

import { Link } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import { useStore } from "../store/useStore";
const sidebarTheme = {
    "root": {
        "base": "h-full",
        "collapsed": {
            "on": "w-16",
            "off": "w-64"
        },
        "inner": "h-full overflow-y-auto overflow-x-hidden rounded bg-gray-50 px-3 py-4 dark:bg-gray-800"
    },
    "collapse": {
        "button": "group flex w-full items-center rounded-lg p-2 text-base font-normal text-gray-900 transition duration-75 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
        "icon": {
            "base": "h-6 w-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white",
            "open": {
                "off": "",
                "on": "text-gray-900"
            }
        },
        "label": {
            "base": "ml-3 flex-1 whitespace-nowrap text-left",
            "icon": {
                "base": "h-6 w-6 transition delay-0 ease-in-out",
                "open": {
                    "on": "rotate-180",
                    "off": ""
                }
            }
        },
        "list": "space-y-2 py-2"
    },
    "cta": {
        "base": "mt-6 rounded-lg bg-gray-100 p-4 dark:bg-gray-700",
        "color": {
            "blue": "bg-cyan-50 dark:bg-cyan-900",
            "dark": "bg-dark-50 dark:bg-dark-900",
            "failure": "bg-red-50 dark:bg-red-900",
            "gray": "bg-alternative-50 dark:bg-alternative-900",
            "green": "bg-green-50 dark:bg-green-900",
            "light": "bg-light-50 dark:bg-light-900",
            "red": "bg-red-50 dark:bg-red-900",
            "purple": "bg-purple-50 dark:bg-purple-900",
            "success": "bg-green-50 dark:bg-green-900",
            "yellow": "bg-yellow-50 dark:bg-yellow-900",
            "warning": "bg-yellow-50 dark:bg-yellow-900"
        }
    },
    "item": {
        "base": "flex items-center justify-center rounded-lg p-2 text-base font-normal text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
        "active": "bg-gray-100 dark:bg-gray-700",
        "collapsed": {
            "insideCollapse": "group w-full pl-8 transition duration-75",
            "noIcon": "font-bold"
        },
        "content": {
            "base": "flex-1 whitespace-nowrap px-3"
        },
        "icon": {
            "base": "h-6 w-6 flex-shrink-0 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white",
            "active": "text-gray-700 dark:text-gray-100"
        },
        "label": "",
        "listItem": ""
    },
    "items": {
        "base": ""
    },
    "itemGroup": {
        "base": "mt-4 space-y-2 border-t border-gray-200 pt-4 first:mt-0 first:border-t-0 first:pt-0 dark:border-gray-700"
    },
    "logo": {
        "base": "mb-5 flex items-center pl-2.5",
        "collapsed": {
            "on": "hidden",
            "off": "self-center whitespace-nowrap text-xl font-semibold dark:text-white"
        },
        "img": "mr-3 h-6 sm:h-7"
    }
}
const NavSideBar = ({ isSidebarOpen }: any) => {
    const { authStore } = useStore();
    const { user } = authStore
    let role = user?.role?.toLowerCase()
    const ProductSection = () => {

        if (role === "associate2") {
            return null;
        }

        return (
            <Sidebar.Collapse
                icon={HiShoppingBag}
                label="Products"
                renderChevronIcon={(theme, open) => {
                    const IconComponent = open ? HiOutlineMinusSm : HiOutlinePlusSm;
                    return <IconComponent aria-hidden className={twMerge(theme.label.icon.open[open ? 'on' : 'off'])} />
                }}
            >
                {<Link to={"/yellowadmin/products/view"}><Sidebar.Item>View Products</Sidebar.Item></Link>}
                <Link to={"/yellowadmin/products/add"}><Sidebar.Item>Add Products</Sidebar.Item></Link>
                {/* <Link to={"/yellowadmin/products/color"}><Sidebar.Item>Product Colors</Sidebar.Item></Link> */}
                <Link to={"/yellowadmin/products/category"}><Sidebar.Item>Product Categories</Sidebar.Item></Link>
                <Link to={"/yellowadmin/products/rawmaterial"}><Sidebar.Item>Raw Material</Sidebar.Item></Link>
                <Link to={"/yellowadmin/products/tag"}><Sidebar.Item>Tags</Sidebar.Item></Link>
                 
            </Sidebar.Collapse>
        );
    };
    const DealerSection = () => {
        if (role !== "admin") {
            return null;
        }

        return (
            <Sidebar.Collapse
                icon={BsIncognito}
                label="Dealer"
                renderChevronIcon={(theme, open) => {
                    const IconComponent = open ? HiOutlineMinusSm : HiOutlinePlusSm;
                    return <IconComponent aria-hidden className={twMerge(theme.label.icon.open[open ? 'on' : 'off'])} />
                }}
            >
                <Link to={"/dealer/signup"}><Sidebar.Item>Dealer Onboard</Sidebar.Item></Link>
                <Link to={"/dealer/approvals"}><Sidebar.Item>Dealer Approvals</Sidebar.Item></Link>
                <Link to={"/dealer"}><Sidebar.Item>Dealer Management</Sidebar.Item></Link>
                <Link to={"/taxslabs"}><Sidebar.Item>Tax Slabs</Sidebar.Item></Link>
            </Sidebar.Collapse>
        );
    };
    const OrderSection = () => {
        if (role === "associate2") {
            return null;
        }
        return (
            <Sidebar.Collapse
                icon={FaShoppingCart}
                label="Orders"
                renderChevronIcon={(theme, open) => {
                    const IconComponent = open ? HiOutlineMinusSm : HiOutlinePlusSm;
                    return <IconComponent aria-hidden className={twMerge(theme.label.icon.open[open ? 'on' : 'off'])} />
                }}
            >
                <Link to={"/yellowadmin/orders/request"}><Sidebar.Item>Orders Request</Sidebar.Item></Link>
                <Link to={"/yellowadmin/orders/approvals"}><Sidebar.Item>Orders Approvals</Sidebar.Item></Link>
                <Link to={"/yellowadmin/orders/approved"}><Sidebar.Item>Orders Management</Sidebar.Item></Link>
            </Sidebar.Collapse>
        );
    };

    const PackingSlip = () => {
        if (role !== "admin") {
            return null;
        }
        return (
            <Sidebar.Collapse
                icon={FaBoxes}
                label="Packing Slip"
                renderChevronIcon={(theme, open) => {
                    const IconComponent = open ? HiOutlineMinusSm : HiOutlinePlusSm;
                    return <IconComponent aria-hidden className={twMerge(theme.label.icon.open[open ? 'on' : 'off'])} />
                }}
            >
                <Link to={"/yellowadmin/PackingSlip"}><Sidebar.Item>Packing Slip List</Sidebar.Item></Link>
                {/* <Link to={"/yellowadmin/PackingSlip"}><Sidebar.Item>Add Packing Slip</Sidebar.Item></Link> */}

            </Sidebar.Collapse>
        );
    };
    const Invoice = () => {
        // return null;
        if (role !== "admin") {
            return null;
        }
        return (
            <Sidebar.Collapse
                icon={FaFileInvoice}
                label="Invoice"
                renderChevronIcon={(theme, open) => {
                    const IconComponent = open ? HiOutlineMinusSm : HiOutlinePlusSm;
                    return <IconComponent aria-hidden className={twMerge(theme.label.icon.open[open ? 'on' : 'off'])} />
                }}
            >
                <Link to={"/yellowadmin/Invoice/InvoiceList"}><Sidebar.Item>Invoice List</Sidebar.Item></Link>
                {/* <Link to={"/yellowadmin/Invoice/AddInvoice"}><Sidebar.Item>Add Invoice</Sidebar.Item></Link> */}

            </Sidebar.Collapse>
        );
    };
    const Transaction = () => {
        // return null;
        if (role === "associate2") {
            return null;
        }
        return (
            <Sidebar.Collapse
                icon={FaMoneyBillWave}
                label="Payments"
                renderChevronIcon={(theme, open) => {
                    const IconComponent = open ? HiOutlineMinusSm : HiOutlinePlusSm;
                    return <IconComponent aria-hidden className={twMerge(theme.label.icon.open[open ? 'on' : 'off'])} />
                }}
            >
                <Link to={"/yellowadmin/Payment/PaymentList"}><Sidebar.Item>Payments List
                </Sidebar.Item></Link>
                <Link to={"/yellowadmin/Payment/AddPayment"}><Sidebar.Item>Add Payments </Sidebar.Item></Link>
                <Link to={"/yellowadmin/Payment/CreditMemo"}><Sidebar.Item>Credit Memo</Sidebar.Item></Link>
            </Sidebar.Collapse>
        );
    };
    const InventorySection = () => {
        return (
            <Sidebar.Collapse
                icon={FaWarehouse}
                label="Inventory"
                renderChevronIcon={(theme, open) => {
                    const IconComponent = open ? HiOutlineMinusSm : HiOutlinePlusSm;
                    return <IconComponent aria-hidden className={twMerge(theme.label.icon.open[open ? 'on' : 'off'])} />;
                }}
            >
                <Link to={"/inventory/add"}> <Sidebar.Item>Add Starting Stock</Sidebar.Item> </Link>
                <Link to={"/inventory/move"}> <Sidebar.Item>Inventory Move</Sidebar.Item> </Link>
                <Link to={"/inventory/damaged"}> <Sidebar.Item>Inventory Damage</Sidebar.Item> </Link>
                <Link to={"/inventory/view"}><Sidebar.Item>Inventory View</Sidebar.Item></Link>
                <Link to={"/inventory/inbound"}><Sidebar.Item>Inbound</Sidebar.Item></Link>
                <Link to={"/inventory/location/view"}> <Sidebar.Item>Inventory Locations</Sidebar.Item> </Link>
            </Sidebar.Collapse>
        );
    }
    const AgentSection = () => {
        return (
            <Sidebar.Collapse
                icon={FaUserTie}
                label="Agent Management"
                renderChevronIcon={(theme, open) => {
                    const IconComponent = open ? HiOutlineMinusSm : HiOutlinePlusSm;
                    return <IconComponent aria-hidden className={twMerge(theme.label.icon.open[open ? 'on' : 'off'])} />;
                }}
            >
                <Link to={"/yellowadmin/agents/add"}><Sidebar.Item >Add Agents</Sidebar.Item> </Link>
                <Link to={"/yellowadmin/agents"}><Sidebar.Item >View Agents</Sidebar.Item> </Link>
            </Sidebar.Collapse>
        );
    }
    // const CustomerSection = () => {
    //     return(
    //         <Sidebar.Collapse
    //         icon={HiUser}
    //         label="Customer"
    //         renderChevronIcon={(theme, open) => {
    //             const IconComponent = open ? HiOutlineMinusSm : HiOutlinePlusSm;
    //             return <IconComponent aria-hidden className={twMerge(theme.label.icon.open[open ? 'on' : 'off'])} />
    //         }}
    //         >
    //         <Link to={"/yellowadmin/customer/add"}><Sidebar.Item>Add customer</Sidebar.Item></Link>
    //         <Link to={"/yellowadmin/customercategory/add"}><Sidebar.Item>Categories</Sidebar.Item></Link>
    //         </Sidebar.Collapse>
    //     )
    // }
    const LogsSection = () => {
        return (
            <Sidebar.Collapse
                icon={BsBarChartFill}
                label="Activity"
                renderChevronIcon={(theme, open) => {
                    const IconComponent = open ? HiOutlineMinusSm : HiOutlinePlusSm;
                    return <IconComponent aria-hidden className={twMerge(theme.label.icon.open[open ? 'on' : 'off'])} />;
                }}
            >
                <Link to={"/logs"}> <Sidebar.Item> Activity Logs</Sidebar.Item> </Link>
            </Sidebar.Collapse>
        );
    }
    return (
        <Sidebar theme={sidebarTheme} aria-label="Sidebar" className={`${isSidebarOpen ? "" : "hidden"} h-[calc(100vh-4rem)] overflow-hidden w-screen sm:w-[18rem] sm:overflow-auto`}>
            <Sidebar.Items className="text-xl">
                <Sidebar.ItemGroup>
                    <Sidebar.Item href="/" icon={HiChartPie}>
                        Dashboard
                    </Sidebar.Item>

                    <ProductSection />
                    <OrderSection />
                    <DealerSection />
                    {/* <CustomerSection/> */}
                    <AgentSection />
                    <PackingSlip />
                    <Invoice />
                    <Transaction />
                    <InventorySection />
                    <LogsSection />
                    {role === 'admin' && (
                        <Sidebar.Collapse
                            icon={MdManageAccounts}
                            label="User Management"
                            renderChevronIcon={(theme, open) => {
                                const IconComponent = open ? HiOutlineMinusSm : HiOutlinePlusSm;
                                return <IconComponent aria-hidden className={twMerge(theme.label.icon.open[open ? 'on' : 'off'])} />;
                            }}
                        >
                            <Link to={"/yellowadmin/users"}><Sidebar.Item >View Users</Sidebar.Item> </Link>
                            <Link to={"/yellowadmin/users/add"}><Sidebar.Item >Add User</Sidebar.Item> </Link>
                        </Sidebar.Collapse>
                    )}

                </Sidebar.ItemGroup>
                <Sidebar.ItemGroup>
                    <Sidebar.Item href="#" icon={BiBuoy}>
                        Help
                    </Sidebar.Item>
                </Sidebar.ItemGroup>
            </Sidebar.Items>
        </Sidebar>
    );
};

export default NavSideBar;
