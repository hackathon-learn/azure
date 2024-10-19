
//js

const dep = require("../model/deployments");

// For View 
const depview = (req, res) => {
    dep.FetchWSRuns(function(ret){
        res.render("deployments", {user:"Nirmal",status:ret} );
    })
}


module.exports =  {
    depview
};

