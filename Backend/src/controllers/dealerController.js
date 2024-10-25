const dealerService = require("../services/dealerService");
const approvedDealerService = require("../services/dealerApprovedService");

const createApprovedDealer = async (req, res) => {
  try {
    const dealer = await approvedDealerService.addDealer(req.body);
    return res.json({ status: true, data: dealer});
  } catch (error) {
    return res.json({ status: false, data: {}, err: error.message });
  }
};

const dealerLogin = async (req, res) => {
    try {
        const { emailId, password } = req.body;
        const { token } = await approvedDealerService.loginDealer(emailId, password);
        return res.json({
            status: true,
            data: { token }
        });
    } catch (error) {
        console.error(error);
        if (!res.headersSent) { // Ensure headers are not already sent
            return res.status(500).json({
                status: false,
                err: error.message
            });
        }
    }
};

const getAllApprovedDealers = async (req, res) => {
  try {
    const dealers = await approvedDealerService.getAllDealers();
    return res.json({ status: true, data: dealers, err: {} });
  } catch (error) {
    return res.json({ status: false, data: {}, err: error.message });
  }
};

const getApprovedDealerById = async (req, res) => {
  try {
    const dealer = await approvedDealerService.getDealerById(req.params.id);
    return res.json({ status: true, data: dealer, err: {} });
  } catch (error) {
    return res.json({ status: false, data: {}, err: error.message });
  }
};

const updateApprovedDealer = async (req, res) => {
  try {
    const dealer = await approvedDealerService.updateDealer(
      req.params.id,
      req.body
    );
    return res.json({ status: true, data: dealer, err: {} });
  } catch (error) {
    return res.json({ status: false, data: {}, err: error.message });
  }
};

const deleteDealer = async (req, res) => {
  try {
    const dealer = await dealerService.deleteDealer(req.params.id);
    return res.json({ status: true, data: dealer, err: {} });
  } catch (error) {
    return res.json({ status: false, data: {}, err: error.message });
  }
};

const createDealer = async (req, res) => {
  try {
    const dealer = await dealerService.createDealer(req.body);
    return res.json({ status: true, data: dealer, err: {} });
  } catch (error) {
    console.log(error);
    return res.json({ status: false, data: {}, err: error.message });
  }
};

const getAllDealers = async (req, res, next) => {
  try {
    const dealers = await dealerService.getAllDealers();
    return res.json({ status: true, data: dealers, err: {} });
  } catch (error) {
    console.log(error);
    return res.json({ status: false, data: {}, err: error.message });
  }
};

const getTempDealerById = async (req, res) => {
  try {
    const dealer = await dealerService.getDealerById(req.params.id);
    return res.json({ status: true, data: dealer, err: {} });
  } catch (error) {
    return res.json({ status: false, data: {}, err: error.message });
  }
};

module.exports = {
  createApprovedDealer,
  dealerLogin,
  getAllApprovedDealers,
  getApprovedDealerById,
  updateApprovedDealer,
  createDealer,
  deleteDealer,
  getAllDealers,
  getTempDealerById,
};
