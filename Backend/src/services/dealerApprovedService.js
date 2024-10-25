const { default: mongoose } = require("mongoose");
const { ApprovedDealer } = require("../config/models/dealerApproved");
const DealerList = require("../config/models/dealerList");
const JwtService = require("../services/jwt-service");
const jwtService = new JwtService();
const CryptService = require("../services/crypt-service");
const cryptService = new CryptService(); // Create an instance of CryptService

const addDealer = async (dealerData) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    if (dealerData.password) {
      dealerData.password = await cryptService.cryptify(dealerData.password);
    }

    const dealer = new ApprovedDealer(dealerData);
    await dealer.save({ session });
    await DealerList.findByIdAndDelete(dealerData.tempid).session(session);
    await session.commitTransaction();
    return dealer;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const loginDealer = async function (emailId, password) {
  try {
    const dealer = await ApprovedDealer.findOne({ emailId });
    if (!dealer) {
      throw new Error("Dealer not found");
    }

    const isPasswordMatch = await cryptService.verify(password, dealer.password);
    if (!isPasswordMatch) {
      throw new Error("Invalid credentials");
    }

    const token = await jwtService.generateToken({ id: dealer._id.toString() });

    if (!Array.isArray(dealer.token)) {
      dealer.token = [];
    }

    dealer.token = dealer.token.concat(token);
    await dealer.save();

    return { token };
  } catch (error) {
    console.error("Error logging in dealer:", error.message);
    throw error;
  }
};

const getAllDealers = async () => {
  try {
    const dealers = await ApprovedDealer.find().populate("province");
    return dealers;
  } catch (error) {
    throw error;
  }
};

const getDealerById = async (id) => {
  try {
    const dealer = await ApprovedDealer.findById(id).populate("province").select('-password');
    if (!dealer) {
      throw new Error("Dealer not found");
    }
    return dealer;
  } catch (error) {
    throw error;
  }
};

const updateDealer = async (id, updateData) => {
  try {
    const dealer = await ApprovedDealer.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate("province");
    if (!dealer) {
      throw new Error("Dealer not found");
    }
    return dealer;
  } catch (error) {
    throw error;
  }
};

const deleteDealer = async (id) => {
  try {
    const dealer = await ApprovedDealer.findByIdAndDelete(id);
    if (!dealer) {
      throw new Error("Dealer not found");
    }
    return dealer;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  addDealer,
  getAllDealers,
  getDealerById,
  updateDealer,
  deleteDealer,
  loginDealer,
};
