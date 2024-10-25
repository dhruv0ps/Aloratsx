import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import 'react-toastify/dist/ReactToastify.css';

import { Provider } from 'mobx-react';
import { authStore } from './store/authStore.ts';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Home from './layout/Home.tsx';
import Dashboard from './features/Dashboard/Dashboard.tsx';
import { ToastContainer } from 'react-toastify';
import AddColor from './features/Products/ColorManage.tsx';
import CategoryManager from './features/Products/CategoryManage.tsx';
import AddProduct from './features/Products/ProductManage.tsx';
import ViewProducts from './features/Products/ViewProducts.tsx';
import AddDealer from './features/Dealer/DealerSignup.tsx';
import TaxSlabManage from './features/Dealer/DealerTaxSlabs.tsx';
import DealersApprovalList from './features/Dealer/DealerApprovals.tsx';
import DealerEditList from './features/Dealer/DealerEditList.tsx';
import DealersList from './features/Dealer/DealerList.tsx';
import OrderForm from './features/Orders/OrderRequest.tsx';
import OrderApprovalList from './features/Orders/OrderApprovals.tsx';
import Orders from './features/Orders/OrderView.tsx';
import LoginDealer from './features/DealerPortal/Login.tsx';
import PackingSlipList from './features/PackingSlip/PackingSlipList.tsx';
import InvoiceList from './features/Invoice/InvoiceList.tsx';
import AddInvoice from './features/Invoice/AddInvoice.tsx';
import InvoiceSummary from './features/Invoice/InvoiceSummary.tsx';
import TransactionList from './features/Transaction/TransactionList.tsx';
import AddStartingStock from './features/InventoryManagement/AddStartingStock.tsx';
import InventoryTable from './features/InventoryManagement/ViewInventory.tsx';
import ViewIncLocations from './features/InventoryManagement/ViewInventoryLocations.tsx';
import InvLocationForm from './features/InventoryManagement/AddInventoryLocation.tsx';
import DamagedProducts from './features/InventoryManagement/DamagedInventory.tsx';
import InventoryMove from './features/InventoryManagement/InventoryMove.tsx';
import LogTable from './features/Activity/SystemLogs.tsx';
import Login from './layout/Login.tsx';
import UserList from './features/UserManagement/UserList.tsx';
import AddUserForm from './features/UserManagement/AddUserForm.tsx';
import TransactionSummary from './features/Transaction/TransactionSummary.tsx';
import CreditMemoPage from './features/Transaction/CreditMemo.tsx';
import InboundPage from './features/InventoryManagement/Inbound.tsx';
import AgentList from './features/Agent/AgentList.tsx';
import AddAgent from './features/Agent/AgentSignup.tsx';
import AgentView from './features/Agent/AgentView.tsx';
import ViewPackingSlip from './features/PackingSlip/ViewPackingSlip.tsx';
import RecordPayment from './features/Transaction/RecordTrans.tsx';
import Addcustomer from './features/Customer/Customersignup.tsx';
import AddCustomerCategory from './features/Customer/AddCustomerCategory.tsx';
import RawMaterialManager from './features/Products/RawmaterialManage.tsx';
import TagManager from './features/Products/TagManegar.tsx';
import ListProduct from './features/Products/ListProduct.tsx';
// import { newProductManger } from './features/Products/newProductManger.tsx';
const stores = { authStore };
const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />, // Use MainLayout for routes that need the sidebar
    children: [
      {
        path: "/",
        element: <Dashboard />,
      },
      //#region products
      {
        path: "/yellowadmin/products/color",
        element: <AddColor />,
      },
      {
        path: "/yellowadmin/products",
        element: <ViewProducts />,
      },
      {
           path:"/yellowadmin/products/view",
           element :<ListProduct/>,
      },
      {
        path: "/yellowadmin/products/category",
        element: <CategoryManager />,
      },
      // {
      //   path:"/yellowadmin/products/addproduct",
      //   element :<newProductManger/>
      // },
      {
        path: "/yellowadmin/products/add",
        element: <AddProduct />,
      },
      {
        path: "/products/manage/:id",
        element: <AddProduct />,
      },
      //#region dealer
      {
        path: "/dealer/signup",
        element: <AddDealer />,
      },
      {
        path: "/taxSlabs",
        element: <TaxSlabManage />,
      },
      {
        path: "/dealer/approvals",
        element: <DealersApprovalList />,
      },
      {
        path: "/dealer",
        element: <DealersList />,
      },
      {
        path: "/dealer/edit/:id",
        element: <DealerEditList />,
      },
      {
        path: "/appdealer/edit/:aid",
        element: <DealerEditList />,
      },
      //#region orders & packing slips
      {
        path: "/yellowadmin/orders/request",
        element: <OrderForm />,
      },
      {
        path: "/yellowadmin/orders/approvals",
        element: <OrderApprovalList />,
      },
      {
        path: "/yellowadmin/orders/approved",
        element: <Orders />,
      },
      {
        path: "/yellowadmin/PackingSlip",
        element: <PackingSlipList />,
      },
      {
        path: "/yellowadmin/PackingSlip/:id",
        element: <ViewPackingSlip />,
      },
      //#region invoice & transactions
      {
        path: "/yellowadmin/Invoice/AddInvoice",
        element: <AddInvoice />,
      },
      {
        path: "/yellowadmin/Invoice/InvoiceList",
        element: <InvoiceList />,
      },
      {
        path: "/yellowadmin/Payment/CreditMemo",
        element: <CreditMemoPage />
      },
      {
        path: "/yellowadmin/Invoice/:id",
        element: <InvoiceSummary />,
      },
      {
        path: "/yellowadmin/Payment/AddPayment",
        element: <RecordPayment />,
      },
      {
        path: "/yellowadmin/Payment/PaymentList",
        element: <TransactionList />,
      },
      {
        path: "/yellowadmin/Payment/PaymentSummary/:id",
        element: <TransactionSummary />
      },
      //#region inventory
      {
        path: "/inventory/add",
        element: <AddStartingStock />
      },
      {
        path: "/inventory/view",
        element: <InventoryTable />
      },
      {
        path: "/inventory/location/view",
        element: <ViewIncLocations />
      },
      {
        path: "/inventory/location/add",
        element: <InvLocationForm />
      },
      {
        path: "/inventory/location/:id/edit",
        element: <InvLocationForm />
      },
      {
        path: "/inventory/damaged",
        element: <DamagedProducts />
      },
      {
        path: "/inventory/move",
        element: <InventoryMove />
      },
      {
        path: "/inventory/inbound",
        element: <InboundPage />
      },
      {
        path: "/logs",
        element: <LogTable />
      },
      //#region users & agents
      {
        path: "/yellowadmin/users",
        element: <UserList />
      },
      {
        path: "/yellowadmin/users/add",
        element: <AddUserForm />
      },
      {
        path: "/yellowadmin/users/:id/edit",
        element: <AddUserForm />
      },
      {
        path: "/yellowadmin/agents",
        element: <AgentList />
      },
      {
        path: "/yellowadmin/agent/view/:id",
        element: <AgentView />
      },
      {
        path: "/yellowadmin/agents/add",
        element: <AddAgent />
      },
      {
        path:"/yellowadmin/customer/add",
        element :<Addcustomer/>
      },
     
      {
        path : "yellowadmin/products/rawmaterial",
        element : <RawMaterialManager/>
      },
      {
        path : "yellowadmin/products/tag",
        element : <TagManager/>
      },
      {
        path:"/yellowadmin/customercategory/add",
        element : <AddCustomerCategory/>
      }
    ]
  },
  {
    path: "/dealerportal/login",
    element: <LoginDealer />,
  },
  //NO sidebar or navbar pages
  {
    path: "/login",
    element: <Login />,
  },

]);



ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider {...stores}>
      <DndProvider backend={HTML5Backend}>
        <RouterProvider router={router} />
      </DndProvider>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover />
    </Provider>
  </React.StrictMode>,

)
