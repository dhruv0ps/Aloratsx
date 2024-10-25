const User = require("../config/models/userModel")
const Tax = require("../config/models/taxSlabModel")
const CryptService = require("../services/crypt-service")
const cryptService = new CryptService()
const mongoose = require('mongoose');

async function clearDatabaseAll() {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
        const collection = collections[key];
        try {
            await collection.drop();
            // if (key === "products")
            console.log(`Collection ${key} dropped successfully`);
        } catch (error) {
            // If the collection doesn't exist, MongoDB will throw an error
            // We can safely ignore this error
            if (error.code === 26) {
                console.log(`Collection ${key} does not exist, skipping`);
            } else {
                console.error(`Error dropping collection ${key}:`, error);
                throw error;  // Re-throw the error if it's not a "collection doesn't exist" error
            }
        }
    }

    console.log('All collections have been dropped');
}

async function clearDatabase() {
    const collections = mongoose.connection.collections;
    const collectionsToClear = ["orders", "invoices", "packingslips", "payments", 'creditmemos'];

    for (const key in collections) {
        if (collectionsToClear.includes(key)) {
            const collection = collections[key];
            try {
                await collection.drop();
                console.log(`Collection ${key} dropped successfully`);
            } catch (error) {
                // If the collection doesn't exist, MongoDB will throw an error
                // We can safely ignore this error
                if (error.code === 26) {
                    console.log(`Collection ${key} does not exist, skipping`);
                } else {
                    console.error(`Error dropping collection ${key}:`, error);
                    throw error;  // Re-throw the error if it's not a "collection doesn't exist" error
                }
            }
        }
    }

    console.log('Specified collections have been dropped');
}

async function createDefaultAdminUser() {

    const existingUsers = await User.countDocuments();
    if (existingUsers === 0) {
        let crypted_pass = await cryptService.cryptify("myPassword@556")
        await User.create({
            username: 'Admin',
            email: 'ADMIN',
            password: crypted_pass,
            role: 'ADMIN'
        });
        console.log('Default admin user created');
    }
}
async function createDefaultExpTax() {
    try {
        const doesExist = await Tax.findOne({
            gst: 0,
            hst: 0,
            qst: 0,
            pst: 0
        });

        if (!doesExist) {
            await Tax.create({
                gst: 0,
                hst: 0,
                qst: 0,
                pst: 0,
                name: "EXPTAX"
            });
            console.log('EXPTAX slab created');
        }
    } catch (error) {
        console.error('Error creating EXPTAX slab:', error);
    }
}



async function _init_methods() {
    try {
        // await clearDatabase()
        await createDefaultAdminUser()
        await createDefaultExpTax()
    } catch (error) {
        console.log("Something went wrong", error)

    }
}

module.exports = _init_methods