export const base = import.meta.env.VITE_API_BASE_URL;
// const base = "http://3.99.86.156:5050/api"
// const base = "https://littlespillsinc.com/api"
// const base = "http://3.110.187.234:3000/api"
// const base = "https://aloratsx-m4l5izmcs-dhruv0ps-projects.vercel.app/api"
export const apiUrl = {

    login: `${base}/loginUser`,
    currentUser: `${base}/current`,
    register: `${base}/register`,
    logout: `${base}/logout`,
    user: `${base}/user`,

    color: `${base}/colors`,
    Category: `${base}/categories`,
    subcategory: `${base}/subcategory`,
    product: `${base}/products`,
    taxslab: `${base}/taxslab`,
    tempdealer: `${base}/tempdealer`,
    approveddealer: `${base}/dealers`,
    order: `${base}/orders`,
    getOrder: `${base}/getorders`,
    logindealer: `${base}/dealers`,
    packingSlip: `${base}/packing`,
    invoice: `${base}/invoice`,
    unpaidinv: `${base}/unpaid-invoices`,
    transaction: `${base}/transaction`,

    rawmaterial :`${base}/rawmaterial`,
    tag : `${base}/tags`,
    customer :`${base}/customer`,
    customerCategory : `${base}/customercategory`,


    agent: `${base}/agents`,
    getinventory: `${base}/getinventory`,
    inventory: `${base}/inventory`,
    invMove: `${base}/invMove`,
    invByLoc: `${base}/inventoryByLocation`,
    invLocations: `${base}/locations`,
    damagedInventory: `${base}/damaged`,

    logs: `${base}/systemLogs`,
    addLogs: `${base}/addLogs`,

    creditMemo: `${base}/creditMemo`,
    payment: `${base}/payments`,

}