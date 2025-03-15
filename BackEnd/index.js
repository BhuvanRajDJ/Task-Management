const express = require("express");
const bodyParser = require('body-parser');
const app = express()
const cors = require("cors");
app.use(cors({
    
}));

require("dotenv").config();
const PORT = process.env.PORT;
require('./models/db');
const TaskRouter = require('./routes/TaskRouter');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.use('/', TaskRouter);
app.listen(PORT, ()=>{
    console.log(`the server is running at the url http://localhost:${PORT}/tasks `)
})