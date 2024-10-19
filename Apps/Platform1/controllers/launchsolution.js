
//js

const solution = require("../model/launchsolution");

// For View 
const VarFileCont = (req, res) => {
    let reponame = req.body.reponame;
    solution.FetchFileContent(reponame,function(varfilecont){
        res.render("launchsolution",{variable:varfilecont,repo:reponame});
    })
    
}


module.exports =  {
    VarFileCont
};

