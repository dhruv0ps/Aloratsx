const NewProduct = require("../config/models/newProductgen")
const DeletedSKUs = require('../config/models/deletedSKU');
const SKU_PREFIX = 'ALP'; // Define your SKU prefix

async function generateSKU() {
    // Find the highest SKU number currently used
    const highestSKU = await NewProduct.find()
        .sort({ SKU: -1 }) // Sort by SKU in descending order
        .limit(1)
        .exec();

    let newSKUIndex = 1; // Default index if no SKUs exist

    // If a SKU already exists, extract the numeric part
    if (highestSKU.length > 0) {
        const highestSKUValue = highestSKU[0].SKU;
        const indexPart = parseInt(highestSKUValue.replace(SKU_PREFIX, ''), 10);
        newSKUIndex = indexPart + 1; // Increment the highest index
    }

    // Ensure the SKU format is always ALP followed by a zero-padded number
    const newSKU = `${SKU_PREFIX}${String(newSKUIndex).padStart(4, '0')}`;

    // Check if SKU exists in deleted SKUs and ensure uniqueness
    const deletedSKU = await DeletedSKUs.findOne({ SKU: newSKU });

    // If the SKU was deleted previously, re-use it
    if (deletedSKU) {
        await DeletedSKUs.deleteOne({ SKU: newSKU }); // Remove from DeletedSKUs
    }

    return newSKU; // Return the new SKU
}

module.exports = generateSKU;