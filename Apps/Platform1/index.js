//js
const express = require('express');
const app = express();
app.set('view engine', 'ejs');
const bodyparser=require("body-parser");

app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended:true}))

//Routes
//app.use('/', require('./routes/home'));
app.use('/', require('./routes/login'));
app.use('/', require('./routes/dashboard'));
app.use('/', require('./routes/launchsolution'));
app.use('/', require('./routes/createcloudresource'));
app.use('/', require('./routes/deployments'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, console.log("Server has started at port " + PORT))