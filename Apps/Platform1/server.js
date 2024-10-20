const express = require('express');
const path=require('path');
const app=express();
const bodyparser=require("body-parser");
const session=require('express-session');
const { v4:uuidv4} = require("uuid");
const port = 3000;
const router = require("./router");


app.set('view engine','ejs')

app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended:true}))
app.use(session({
    secret:uuidv4(),
    resave: false,
    saveUninitialized: true
}))
app.use('/static',express.static(path.join(__dirname,'public')))
app.use('/assets',express.static(path.join(__dirname,'public/assets')))
app.use('/route',router);



//home route
app.get('/',(req,res)=>{
    res.render('home',{title:"FamilyMan"})
})

app.listen(port,()=>{console.log('Application started on http://localhost:'+port)})