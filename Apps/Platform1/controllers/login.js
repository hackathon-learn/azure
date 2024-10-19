
//js

// For View 
const loginView = (req, res) => {
    res.render("login", {
    } );
}

const login = (req, res) => {
    res.redirect("dashboard");
}

module.exports =  {
    loginView,
    login
};

