
const  pool  = require("./dbconfig");
function querydb(table,sel_field,field,cond,fn) {
    pool.query(`SELECT `+ sel_field +` FROM `+ table +` WHERE `+ field +` = $1`,
    [cond],
    (err,results) => {
        if (err){
            retval=err
        }
        else{
            retval=results
        }
        fn(retval);  
    })
}

module.exports = {
    querydb
};