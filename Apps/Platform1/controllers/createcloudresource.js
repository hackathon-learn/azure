
//js

const CloudResource = require("../model/createcloudresource");

// For View 
const CreateCloud = (req, res) => {
    let reponame = req.body.reponame;
    let allvariable =  req.body;
    CloudResource.CreateWS(reponame,allvariable,function(result){
        res.end(result)
    })
    
}



module.exports =  {
    CreateCloud
};
