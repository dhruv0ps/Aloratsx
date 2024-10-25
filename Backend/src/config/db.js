const mongoose = require("mongoose")

const db_dev = "mongodb+srv://mtduser001:jYkAN8uB0xCFF4dz@cluster0.fwesurt.mongodb.net/spillz?retryWrites=true&w=majority&appName=Cluster0"
// 
const db_devv = "mongodb+srv://bhailupatel1908:Bhailu%402002@cluster0.ai49u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
mongoose.connect(db_devv)
// mongoose.connect('mongodb://localhost:27017/spills-development?replicaSet=rs0')
let db = mongoose.connection

db.on('error', console.error.bind(console, "[[[Database connection error]]]"))
db.once('open', () => {
    console.log("[[ Database Connected Successfully ]]")
})


module.exports = db