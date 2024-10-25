const EstimateService = require("../services/estimateServies");

// Controller for generating an estimate
module.exports.createEstimate = async (req, res) => {
  try {
    const estimateData = req.body;
    const newEstimate = await EstimateService.generateEstimate(estimateData);

    return res.status(201).json({
      status: true,
      estimate: newEstimate,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      err: error.message,
    });
  }
};

module.exports.getAllEstimates = async (req, res) => {
  try {
    // Call the service function to get all estimates
    const estimates = await EstimateService.getAllEstimates();

    // Respond with the list of estimates
    res.status(200).json({
      status: true,
      data: estimates,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      err: error.message,
    });
  }
};

module.exports.getEstimateById = async (req, res) => {
  const { id } = req.params;

  try {
    const estimate = await EstimateService.getEstimateById(id);

    res.status(200).json({
      message: "Estimate retrieved successfully",
      estimate,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve estimate",
      err: error.message,
    });
  }
};

module.exports.getEstimateListbyDealerName = async (req, res) => {
  const { id } = req.body;
  try {
    const estimate = await EstimateService.getEstimateListbyDealer(id);

    res.json({
      status: true,
      data: estimate,
    });
  } catch (error) {
    res.json({
      status: false,
      err: error.message,
    });
  }
}

module.exports.getEstimateByEstimateNumber = async (req, res) => {
  const { id } = req.body;

  try {
    const estimate = await EstimateService.getEstimateByEstimateNum(id);
    res.status(200).json({
      status: true,
      data: estimate,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      err: error.message,
    });
  }
};

module.exports.deleteEstimate = async (req, res)=>{
  const {id}= req.body;
  try{
    const estimate= await EstimateService.deleteEstimate(id);
    res.status(200).json({
      status:true,
      data:estimate
    })
  }catch(error){
    res.status(500).json({
      status:false,
      err:error.message
    })
  }
}