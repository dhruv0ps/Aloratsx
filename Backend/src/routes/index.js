const express = require("express")
var router = express.Router();
var bodyParser = require("body-parser")

const { imageUpload, fileUpload } = require("../config/multerConfig");
const { authenticateTokenAdmin } = require("../config/auth");
const userController = require("../controllers/userController")

// const productController = require("../controllers/productController")
const productController = require("../controllers/newProductController");
const configController = require("../controllers/colorcategoryController")
const dealerController = require("../controllers/dealerController")
const orderController = require('../controllers/orderController');
const locationController = require('../controllers/locationController');
const packingController = require("../controllers/packingSlipController");
const invoiceController = require("../controllers/invoiceController");
const inventoryController = require('../controllers/inventoryController')
const logsController = require("../controllers/logController");
const creditMemoController = require("../controllers/creditMemoController");
const agentController = require('../controllers/agentController');
const PaymentController = require('../controllers/paymentController');
const customercategoryController = require("../controllers/customercategoryController");
const rawMaterialController =require("../controllers/rawMaterialController");
const tagController = require('../controllers/tagContreller');
const customerController = require ("../controllers/customerController");
const InboundController = require('../controllers/inboundController');

var jsonParser = bodyParser.json()
router.use(jsonParser)

// #region Auth
router.post("/loginUser", userController.loginUser)
router.get('/current', authenticateTokenAdmin, userController.getCurrentUser);
router.post('/logout', authenticateTokenAdmin, userController.logoutUser);
router.get('/user/:id', authenticateTokenAdmin, userController.getUser);
router.get('/user/', authenticateTokenAdmin, userController.getAllUsers);
router.post('/user/', authenticateTokenAdmin, userController.createUser);
router.post('/user/:id', authenticateTokenAdmin, userController.updateUser);

// #region Products
// router.post('/product/add', imageUpload.fields([
//     { name: 'heroImage', maxCount: 1 },
//     { name: 'childrenImages', maxCount: 30 }
// ]), productController.addProduct);
// router.get('/product/:id', productController.getProductById);
// router.post('/product/:id', imageUpload.fields([
//     { name: 'heroImage', maxCount: 1 },
//     { name: 'childrenImages', maxCount: 30 }
// ]), productController.updateProduct);
// router.post('/product/', productController.getAllProducts);
// router.get('/products/', productController.getAllProduct);
// router.get('/product/search/:name', productController.searchProductByName);
// router.get('/product/discounted/:dealerId', productController.getDiscountedProducts);
// router.post('/productbulk', fileUpload.single('file'), productController.bulkUpload);

router.get('/products', productController.getAllProducts);
router.get('/products/:id', productController.getProductById);
router.post('/products', productController.createProduct);
router.put('/products/:id', productController.updateProductById);
router.delete('/products/:parentId/child/:childSKU', productController.deleteProductById);
router.put('/products/:parentProductId/children/:childSKU',productController.updateProductStatus)
router.get('/products/child-id/:childIdentifier', productController.getProductByChildIdOrSKU);

// Color Routes
router.post('/colors', configController.addColor);
router.get('/colors', configController.getAllColors);
router.put('/colors/:id', configController.updateColor);
router.delete('/colors/:id', configController.deleteColor);

// Category Routes with image upload for category image
router.post('/categories', imageUpload.single('image'), configController.addCategory);
router.get('/categories', configController.getAllCategories);
router.put('/categories/:id', imageUpload.single('image'), configController.updateCategory);
router.delete('/categories/:id', configController.deleteCategory);
router.post('/subcategory/:id', configController.addSubCategory);
router.get('/subcategory/:id', configController.getAllSubCategories);
router.put('/subcategory/:id', configController.updateSubCategory);
//rawmaterial
router.post('/rawmaterial', imageUpload.single('image'), rawMaterialController.createRawMaterial);
router.get('/rawmaterial', rawMaterialController.getRawMaterials);
router.get('/rawmaterial/:id', rawMaterialController.getRawMaterialById);
router.put('/rawmaterial/:id', imageUpload.single('image'), rawMaterialController.updateRawMaterialById);
router.delete('/rawmaterial/:id', rawMaterialController.deleteRawMaterialById);

//tags
router.post('/tags', tagController.createTag);
router.get('/tags', tagController.getAllTags);
router.get('/tags/:id', tagController.getTagById);
router.put('/tags/:id', tagController.updateTag);
router.delete('/tags/:id', tagController.deleteTag);
// tax slabs
router.post('/taxslab/add', configController.addTax);
router.get('/taxslab', configController.getAllTaxSlabs);
router.put('/taxslab/:id', configController.updateTaxSlab);

// #region Dealer
router.get("/tempdealer", dealerController.getAllDealers);
router.get('/tempdealer/:id', dealerController.getTempDealerById);
router.post("/tempdealer/add", dealerController.createDealer);
router.post("/tempdealer/:id", dealerController.deleteDealer);

router.post('/dealers/add', dealerController.createApprovedDealer);
router.post('/dealers/login', dealerController.dealerLogin);
router.get('/dealers', dealerController.getAllApprovedDealers);
router.get('/dealers/:id', dealerController.getApprovedDealerById);
router.put('/dealers/:id', dealerController.updateApprovedDealer);

// #region order & packing slips
router.post('/orders', orderController.createOrder);
router.put('/orders/:id', orderController.updateOrder);
router.get('/orders/:id', orderController.getOrderById);
router.get('/getorders/pending', orderController.getPendingOrders);
router.get('/getorders/approved', orderController.getApprovedOrders);
router.post('/orders/dealer', orderController.getOrderByDealerId);
router.post('/orders/po', orderController.getOrderByOrderNUmbr);

router.get('/packing/:id', packingController.getPackingSlipById);
router.post('/packing/paged', packingController.getAllPackingSlips);
router.post('/packing/', packingController.createPackingSlip);
router.put('/packing/:id', packingController.updatePackingSlip);
// router.delete('packing/:id', packingController.deletePackingSlip);

// #region Invoice & payments
router.get('/invoice/:id', invoiceController.getInvoiceById);
router.post('/invoice/', invoiceController.getAllInvoices);
router.put('/invoice/:id', invoiceController.updateInvoice);
router.get('/unpaid-invoices/:dealerId', PaymentController.getUnpaidInvoices);

router.post('/payments', PaymentController.createPayment);
router.post('/payments/all', PaymentController.getAllPayments);
router.post('/creditMemo-validate', PaymentController.validateCreditMemo);
router.post("/creditMemo/create", creditMemoController.createCreditMemo);
router.get("/creditMemo/all", creditMemoController.getAllCreditMemos);
router.post("/creditMemo/id", creditMemoController.getCreditMemoById);
router.put("/creditMemo/update/:creditMemoId", creditMemoController.updateCreditMemo);
router.delete('/creditMemo/:creditMemoId', creditMemoController.deleteCreditMemo);

// #region location
router.post('/locations', locationController.addLocation);
router.get('/locations', locationController.getAllLocations);
router.put('/locations/:id', locationController.updateLocation);
router.get('/locations/:id', locationController.getLocationById);

// #region Inventory and Inbound
router.post('/inbound/drafts', authenticateTokenAdmin, InboundController.createDraft);
router.post('/inbound/list', authenticateTokenAdmin, InboundController.getAllInbound);
router.get('/inbound/drafts/:id', authenticateTokenAdmin, InboundController.getDraftById);
router.put('/inbound/drafts/:id', authenticateTokenAdmin, InboundController.updateDraft);
router.post('/inbound/drafts/:id/complete', authenticateTokenAdmin, InboundController.completeDraft);
router.post('/inbound/drafts/:id/cancel', authenticateTokenAdmin, InboundController.cancelDraft);


router.post('/inventory', imageUpload.single('receiptFile'),inventoryController.addStartingStock);
router.get('/inventory/:id', inventoryController.getInventoryById);
router.put('/inventory/mark-completed/:id', inventoryController.markAsCompleted);   
router.get('/inventoryByLocation/:id', inventoryController.getInventoryByLocation);
router.post('/getInventory', inventoryController.getAllInventories);
router.put('/inventory/:id', inventoryController.updateInventory);
router.post('/invMove', inventoryController.moveInventory);
router.get('/damaged', inventoryController.getAllDamagedProducts);
router.post('/damaged',imageUpload.array('images',5), inventoryController.addDamagedProduct);
router.put('/damaged/:id', inventoryController.updateDamagedProduct)

//#region agent
router.post('/agents/add', agentController.createAgent);
router.get('/agents', agentController.getAgents);
router.get('/agents/:id', agentController.getAgentById);
router.put('/agents/:id', agentController.updateAgentById);

router.post('/systemLogs', logsController.getAllLogs)
router.post('/addLogs', logsController.addLog)


//Customer 
router.post('/customers', customerController.createCustomer);
router.get('/customers', customerController.getCustomers);
router.get('/customers/:id', customerController.getCustomerById);
router.put('/customers/:id', customerController.updateCustomer);
router.delete('/customers/:id', customerController.deleteCustomer);
router.patch('/customers/:id/activate', customerController.activateCustomer);

router.post("/customercategory/add",customercategoryController.createCategory)
router.get("/customercategory",customercategoryController.getCategories)
router.put("/customercategory/:id",customercategoryController.updateCategory)
router.get("/customercategory/:id",customercategoryController.getCategoryById);
router.put("/cutomercategory/activate/:id",customercategoryController.activateCategory);

module.exports = router;