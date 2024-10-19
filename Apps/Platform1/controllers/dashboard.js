
//js

const dashboard = require("../model/dashboard");

// For View 
const DashBoardView = (req, res) => {
    let repos
    dashboard.FetchRepo(function(repos){
        
        //rep = JSON.parse(repos)
        if (repos.status == 200 ){
            res.render("dashboard", {user:"Nirmal",status:"OK",repo:repos} );
        }else{
            res.render("dashboard", {user:"Nirmal",status:"NOTOK"} );
        }
        
    })
    
}


module.exports =  {
    DashBoardView
};

