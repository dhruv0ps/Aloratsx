// export const base = "http://localhost:3000/api"
// const base = "http://3.99.86.156:5050/api"
// const base = "https://littlespillsinc.com/api"
const base = "https://vercel.com/dhruv0ps-projects/aloratsx/9DcimQb3vscszUXsKdRL81jdhVPs/api"
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