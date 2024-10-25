require('dotenv').config();
const express = require('express')
const app = express()
const cors = require('cors')
var routes = require("./routes/index")
const server = require("http").Server(app)
var db = require("./config/db")
const init = require("./config/init")

app.set('port', process.env.PORT || 3000)
app.use(express.json()); // To parse JSON request body
app.use(express.urlencoded({ extended: true })); 
app.use('/uploads', express.static('uploads'));
app.use(cors())

app.get('/api/check', (req, res) => {
  res.status(200).send('Hello World!')
})
app.use("/api/", routes)
app.use((req, res, next) => {
  let err = new Error("Not Found");
  err.status = 404
  next(err)
})

init()
server.listen(app.get('port'), () => {
  console.log(`Server started on ${app.get('port')}`)
})
