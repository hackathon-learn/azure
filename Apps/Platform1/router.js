var express = require("express");
const fs = require('fs');
var router = express.Router();
const bcrypt = require("bcrypt");
const  pool  = require("./dbconfig");
const dbdml = require('./db-dml');
const {Octokit} = require("octokit")
const axios = require('axios');

async function  triggerWorkflow2(inputVariables){
    try {
        const response = await axios.post(
            `https://api.github.com/repos/familyman-in/admin/actions/workflows/pushsolution.yml/dispatches`,
            {
                ref: 'main', // or any other branch/ref
                inputs: inputVariables
            },
            {
                headers: {
                    'Authorization': `token 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`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );
        
        console.log('Workflow dispatched successfully:', response.data);
    } catch (error) {
        console.error('Failed to dispatch workflow:', error.response.data);
    }
}


async function fetchRepositories() {
    try {
        const response = await axios.get(`https://api.github.com/orgs/familyman-in/repos`, {
            headers: {
                Authorization: `token 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`
            }
        });
        return response.data.map(repo => ({
            name: repo.name,
            description: repo.description || 'No description',
            lastUpdated: repo.updated_at
        }));
    } catch (error) {
        console.error('Error fetching repositories:', error.message);
        return [];
    }
}

async function triggerWorkflow(p1,p2,p3,p4,p5,p6,p7,p8) {
    try {
        // GitHub repository owner and name
        const owner = 'familyman-in';
        const repo = 'admin';

        // GitHub Personal Access Token with repo scope
        const token = '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';

        // Name of the workflow you want to trigger
        const workflowName = 'createdsspdockerimg.yml';

        // Inputs for the workflow (if any)
        const inputs = {
            input_gitkey: p1,
            input_gitorg: p2,
            input_tforgkey: p3,
            input_tftkey: p4,
            input_tforg: p5,
            input_tfprojectid: p6,
            input_cloudkey:	p7,
            input_cloudprj: p8

        };

        // GitHub Actions workflow dispatch endpoint
        const url = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowName}/dispatches`;

        // Send POST request to trigger workflow
        const response = await axios.post(url, {
            ref: 'main', // Branch to trigger the workflow on
            inputs: inputs
        }, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        console.log('Workflow triggered successfully:');
    } catch (error) {
        console.error('Failed to trigger workflow:', error.response ? error.response.data : error.message);
    }
}



async function fileFetch(gitkey,gitorg,usremail,funres) {
    let timestamp = new Date().toISOString();
    const octokit = new Octokit({
      auth: gitkey ,
      });
      try{
      const response = await octokit.request('POST /orgs/'+gitorg+'/repos', {
        org: gitorg,
        name: 'familyman',
        description: 'This is your first repository',
        homepage: 'https://github.com',
        'private': true,
        has_issues: true,
        has_projects: true,
        has_wiki: true,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      });
      try{
      pool.query(`update config set git_key=$1 , git_org=$2, git_time=$3 where email_id =  $4 `,
        [gitkey,gitorg,timestamp,usremail],
        (err,results) => {
        if (err){
            funres("Thats not you. please try again later");
        }
            }
            )
            funres("Succesfully Created Github Repo.")
      }catch(exp){
        funres("Error creating GitHub Repo.")
      }
    }catch(exp){
        funres("Error creating GitHub Repo")
    }
      }

router.post('/login', (req,res)=>{
    let errors = [];
    if ( req.body.email != "" || req.body.password != "" ){
         
        pool.query(`SELECT * FROM usrprofile WHERE email_id = $1`,
            [req.body.email],
            (err,results) => {
                if (err){
                    throw err;
                }
                if(results.rows.length > 0){
                    pool.query(`SELECT * FROM usrprofile WHERE email_id = $1`,
                    [req.body.email],
                    (err,results) => {
                        if (err){
                            throw err;
                        }
                        if(results.rows.length > 0){
                            (async () => {
                            const passval = await bcrypt.compare(req.body.password , results.rows[0].password)
                            if ( passval ){
                                req.session.user = req.body.email;
                                res.redirect('/route/dashboard');
                            }else{
                                errors.push({message : "Invalid credential combination!!"});
                                res.render('base',{title:"FamilyMan",errors});
                            }
                            })();
                        }
                    })
                }else{
                    errors.push({message : "You are not with us, considor creating a new account!!"});
                    res.render('base',{title:"FamilyMan",errors});
                }
            })
        }else{
            errors.push({message : "Email and Password is required to login "});
            res.render('base',{title:"FamilyMan",errors}); 
        }
        });

router.get('/dashboard',async (req,res)=> {
    let errors = [];
    var git_status 
    var  git_time 
    var tf_status 
    var tf_time 
    var cloud_status
    var cloud_time
    if(req.session.user){
        dbdml.querydb('usrprofile','*', 'email_id', req.session.user,function(result){
            if(result.rowCount > 0){
                    dbdml.querydb('config','*', 'email_id', req.session.user,function(result1){
                        if(result1.rowCount > 0 && result1.rows[0].git_key != null ){
                            git_status = "YES";
                            gdata=33;
                            git_time = result1.rows[0].git_time;
                               // res.render('dashboard',{user:result.rows[0].fname,usertype:result.rows[0].usage,git:'YES',gittime:result1.rows[0].git_time})
                            }else{
                                git_status = "NO";
                                git_time = "NA";
                                gdata= 0;
                                // res.render('dashboard',{user:result.rows[0].fname,usertype:result.rows[0].usage,git:'NO'})
                        }

                        if(result1.rowCount > 0 && result1.rows[0].tf_key != null ){
                            tf_status = "YES"
                            tdata=33;
                            tf_time = result1.rows[0].tf_time
                               // res.render('dashboard',{user:result.rows[0].fname,usertype:result.rows[0].usage,git:'YES',gittime:result1.rows[0].git_time})
                            }else{
                                tf_status = "NO"
                                tf_time = "NA"
                                tdata=0;
                                // res.render('dashboard',{user:result.rows[0].fname,usertype:result.rows[0].usage,git:'NO'})
                        }

                        if(result1.rowCount > 0 && result1.rows[0].cloud_key != null ){
                            cloud_status = "YES"
                            cdata=33;
                            cloud_time = result1.rows[0].cloud_time
                               // res.render('dashboard',{user:result.rows[0].fname,usertype:result.rows[0].usage,git:'YES',gittime:result1.rows[0].git_time})
                            }else{
                                cdata=0;
                                cloud_status = "NO"
                                cloud_time = "NA"
                                // res.render('dashboard',{user:result.rows[0].fname,usertype:result.rows[0].usage,git:'NO'})
                        }

                        res.render(
                            'dashboard',
                            {
                                user:result.rows[0].fname,
                                usertype:result.rows[0].usage,
                                git:git_status,
                                gittime:git_time,
                                tf:tf_status,
                                tftime:tf_time,
                                cloud:cloud_status,
                                cloudtime:cloud_time,
                                data: [gdata, tdata, cdata]
                            }
                        )
                    })
                    
                }else{
                    errors.push({message : "Error fetching user details. Contact FamilyMan"});
                    res.render('base',{title:"FamilyMan",errors});
            }
        })
    }else{
        errors.push({message : "Invalid Session. Try loggin in again."});
        res.render('base',{title:"FamilyMan",errors});
    }
})

router.get('/logout',(req,res)=>{
    req.session.destroy(function(err){
        if(err){
            res.send("Error")
        }else{
            res.render('base',{title:"FamilyMan",logout:'logout Success'})
        }
    })
})

router.get('/base',(req,res)=>{
    res.render('base',{user:"new user"})
})

router.get('/signup',(req,res)=>{
    res.render('signup',{user:"new user"})
})

router.post('/signup',async (req,res)=>{
    let timestamp = new Date().toISOString();
    let { email , fname , lname , password , usage } = req.body;
    let errors = [];
    if ( !email || !fname || !lname || !password || !usage ){
        errors.push({message : "Please provide all details."});
    }
    if ( password.length < 5 ){
        errors.push({message : "Password must be atleast 5 charaters."});
    }
    if ( errors.length > 0 ){
        res.render('signup',{errors});
    }else{
        let hashedPassword = await bcrypt.hash(password,10);
        
        pool.query(`SELECT * FROM usrprofile WHERE email_id = $1`,
            [email],
            (err,results) => {
                if (err){
                    throw err;
                }
                if(results.rows.length > 0){
                    errors.push({message:"You are already in our family!!"})
                    res.render('signup',{errors});
                }else{
                    pool.query(
                        `INSERT INTO usrprofile (email_id,fname,lname,password,usage,created_at) VALUES ( $1,$2,$3,$4,$5,$6)`,
                        [email,fname,lname,hashedPassword,usage,timestamp],
                        (err,results) => {
                        if (err){
                            errors.push({message:"Error getting you in . Please try again later."})
                            res.render('signup',{errors});
                        }
                        if(results.rowCount > 0){
                            pool.query(
                                `INSERT INTO config (email_id) VALUES ($1)`,
                                [email],
                                (err,results) => {
                                if (err){
                                    errors.push({message:"Error getting you in . Please try again later."})
                                    res.render('signup',{errors});
                                }
                                if(results.rowCount > 0){
                                    errors.push({message:"You are in our family now!!"})
                                    res.render('signup',{errors});
                                }
                            }
                            )
                        }
                    }
                    )
                }
            }
        )
    }
})

router.get('/configuration',(req,res)=>{
    let errors = [];
    if(req.session.user){
        pool.query(`SELECT * FROM usrprofile WHERE email_id = $1`,
            [req.session.user],
            (err,results) => {
                if (err){
                    errors.push({message : "Error fetching user details. Contact FamilyMan"});
                    res.render('base',{title:"FamilyMan",errors,user:results.rows[0].fname});
                }
                if(results.rows.length > 0){
                    res.render('configuration',{user:results.rows[0].fname})
                }else{
                    errors.push({message : "Error fetching user details. Contact FamilyMan"});
                    res.render('base',{title:"FamilyMan",errors,user:results.rows[0].fname});
                }})
    }else{
        errors.push({message : "Invalid Session. Try loggin in again."});
        res.render('base',{title:"FamilyMan",errors});
    }
})

router.post('/gitconf',(req,res)=>{
    let errors = [];
    if(req.session.user){
        pool.query(`SELECT * FROM usrprofile WHERE email_id = $1`,
            [req.session.user],
            (err,results) => {
                if (err){
                    throw err;
                }
                if(results.rows.length > 0){
                    let { gitkey , gitorg } = req.body;
                    let errors = [];
                    if ( !gitkey || !gitorg ){
                        errors.push({message : "Please provide all required details to configure GitHub."});
                        res.render('configuration',{title:"FamilyMan",errors,user:results.rows[0].fname});
                    }else{
                        fileFetch(gitkey,gitorg,req.session.user,function(gitreturn){
                            errors.push({message : gitreturn});
                            res.render('configuration',{title:"FamilyMan",errors,user:results.rows[0].fname});
                        })
                    }
                }else{
                    errors.push({message : "Error fetching user details. Contact FamilyMan"});
                    res.render('base',{title:"FamilyMan",errors});
                }})
    }else{
        errors.push({message : "Invalid Session. Try loggin in again."});
        res.render('base',{title:"FamilyMan",errors});
    }
})

router.post('/tfconf',(req,res)=>{
    let errors = [];
    let timestamp = new Date().toISOString();
    if(req.session.user){
        pool.query(`SELECT * FROM usrprofile WHERE email_id = $1`,
            [req.session.user],
            (err,results) => {
                if (err){
                    throw err;
                }
                if(results.rows.length > 0){
                    let { tfkey , tforg , tfteamkey } = req.body;
                    let errors = [];
                    if ( !tfkey || !tforg || !tfteamkey ){
                        errors.push({message : "Please provide all required details to configure Terraform Cloud."});
                        res.render('configuration',{title:"FamilyMan",errors,user:results.rows[0].fname});
                    }else{
                        const apiUrl = 'https://app.terraform.io/api/v2/organizations/'+tforg+'/projects';
                        const token = tfkey
                        const data = {
                            "data": {
                              "attributes": {
                                "name": "familyman",
                                "description": "This project is created and maintained by familyman.in"
                              },
                              "type": "projects"
                            }
                          }
                        

                        const requestOptions = {
                            method: 'POST',
                            headers: {
                            'Content-Type': 'application/vnd.api+json',
                            'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify(data)
                        };


                        fetch(apiUrl, requestOptions)
                        .then(response => {
                            if (!response.ok) {
                                errors.push({message : "Error creating project in Terraform Cloud. Please try again later.3"});
                                res.render('configuration',{title:"FamilyMan",errors,user:results.rows[0].fname});
                                
                            }
                            return response.json();
                        })
                            .then(data =>{
                                
                                try{
                                    pool.query(`update config set tf_key=$1 , tf_org_at=$2, tf_time=$3, tft_key=$4, tffolderid=$5 where email_id=$6 `,
                                      [tfkey,tforg,timestamp,tfteamkey,data.data.id,req.session.user],
                                      (err,results1) => {
                                      if (err){
                                        errors.push({message : "Error creating project in Terraform Cloud. Please try again later.1"});
                                        res.render('configuration',{title:"FamilyMan",errors,user:results.rows[0].fname});
                                      }else{
                                        errors.push({message : "Succesfully Created project in Terraform Cloud"});
                                            res.render('configuration',{title:"FamilyMan",errors,user:results.rows[0].fname});
                                      }
                                          }
                                          )
                                          
                                    }catch(exp){
                                        errors.push({message : "Error creating project in Terraform Cloud. Please try again later.2"});
                                        res.render('configuration',{title:"FamilyMan",errors,user:results.rows[0].fname});
                              
                                    }
                            
                          }) 
                    }
                }else{
                    errors.push({message : "Error fetching user details. Contact FamilyMan"});
                    res.render('base',{title:"FamilyMan",errors});
                }})
    }else{
       errors.push({message : "Invalid Session. Try loggin in again."});
       res.render('base',{title:"FamilyMan",errors});
    }
})

router.post('/cloudconf',(req,res)=>{
    let errors = [];
    let timestamp = new Date().toISOString();
    if(req.session.user){
        pool.query(`SELECT * FROM usrprofile WHERE email_id = $1`,
            [req.session.user],
            (err,results) => {
                if (err){
                    throw err;
                }
                if(results.rows.length > 0){
                    let { cspkey , cspprjid } = req.body;
                    let errors = [];
                    if ( !cspkey || !cspprjid ){
                        errors.push({message : "Please provide all required details to configure GCP Cloud."});
                        res.render('configuration',{title:"FamilyMan",errors,user:results.rows[0].fname});
                    }else{
                        //Do something to check access.
                                try{
                                    pool.query(`update config set cloud_key=$1 , cloud_orgprjfldr=$2, cloud_time=$3 where email_id =  $4 `,
                                      [cspkey,cspprjid,timestamp,req.session.user],
                                      (err,results1) => {
                                      if (err){
                                        errors.push({message : "GCPDB1. Its not you. Please try again later"});
                                        res.render('configuration',{title:"FamilyMan",errors,user:results.rows[0].fname});
                                      }else{
                                        errors.push({message : "Succesfully Configured GCP Cloud"});
                                            res.render('configuration',{title:"FamilyMan",errors,user:results.rows[0].fname});
                                      }
                                          }
                                          )
                                          
                                    }catch(exp){
                                        errors.push({message : "GCPDB2. Its not you. Please try again later"});
                                        res.render('configuration',{title:"FamilyMan",errors,user:results.rows[0].fname});
                              
                                    }
                    }
                }else{
                    errors.push({message : "Error fetching user details. Contact FamilyMan"});
                    res.render('base',{title:"FamilyMan",errors});
                }})
    }else{
       errors.push({message : "Invalid Session. Try loggin in again."});
       res.render('base',{title:"FamilyMan",errors});
    }
})



router.get('/ssp',(req,res)=>{
    let errors = [];
    if(req.session.user){
        pool.query(`SELECT * FROM usrprofile WHERE email_id = $1`,
            [req.session.user],
            async (err,results) => {
                if (err){
                    errors.push({message : "Error fetching user details. Contact FamilyMan"});
                    res.render('base',{title:"FamilyMan",errors});
                }
                if(results.rows.length > 0){
                    const repositories = await fetchRepositories();
                    res.render('ssp',{user:results.rows[0].fname,repos:repositories});
    
                }else{
                    errors.push({message : "Error fetching user details. Contact FamilyMan"});
                    res.render('base',{title:"FamilyMan",errors});
                }})
    }else{
        errors.push({message : "Invalid Session. Try loggin in again."});
        res.render('base',{title:"FamilyMan",errors});
    }
})

router.post('/docker',(req,res)=>{
    let errors = [];
    action = req.body.action;
    if(req.session.user){
        pool.query(`SELECT * FROM usrprofile WHERE email_id = $1`,
            [req.session.user],
            async (err,results1) => {
                if (err){
                    errors.push({message : "Error fetching user details. Contact FamilyMan"});
                    res.render('base',{title:"FamilyMan",errors});
                }
                const repositories = await fetchRepositories();
                if(results1.rows.length > 0){
                    if ( action == "a3"){
                                         
                        
                        pool.query(`SELECT * FROM config WHERE email_id = $1`,
                        [req.session.user],
                        async (err,results) => {
                            if (err){
                                errors.push({message : "Error fetching user details. Contact FamilyMan"});
                                res.render('ssp',{user:results1.rows[0].fname,title:"FamilyMan",errors});
                            }
                            
                            if(results.rows.length > 0){
                                
                                await triggerWorkflow(
                                    results.rows[0].git_key,
                                    results.rows[0].git_org,
                                    results.rows[0].tf_key,
                                    results.rows[0].tft_key,
                                    results.rows[0].tf_org_at,
                                    results.rows[0].tffolderid,
                                    results.rows[0].cloud_key,
                                    results.rows[0].cloud_orgprjfldr
                                );
                                
                                res.render('ssp',{user:results1.rows[0].fname,title:"FamilyMan",repos:repositories,depstatus:'Deployment Started.'});
                                }
                            
                            
                        })
                    }
                    if ( action == "a1")
                        {
                        res.render('ssp',{user:results1.rows[0].fname,title:"FamilyMan",repos:repositories,depstatus:'Current Version : Dummy'});
                        }
                    if ( action == "a2")
                        {
                        res.render('ssp',{user:results1.rows[0].fname,title:"FamilyMan",repos:repositories,depstatus:'Latest Version : Dummy'});
                        }
                    
    
                }else{
                    errors.push({message : "Error fetching user details. Contact FamilyMan"});
                    res.render('base',{title:"FamilyMan",errors});
                }})
    }else{
        errors.push({message : "Invalid Session. Try loggin in again."});
        res.render('base',{title:"FamilyMan",errors});
    }
})

router.post('/pushsolution',(req,res)=>{
    let errors = [];
    solname = req.body.reponame;
    if(req.session.user){
        pool.query(`SELECT * FROM usrprofile WHERE email_id = $1`,
            [req.session.user],
            async (err,results) => {
                if (err){
                    errors.push({message : "Error fetching user details. Contact FamilyMan"});
                    res.render('base',{title:"FamilyMan",errors,user:results.rows[0].fname});
                }
                if(results.rows.length > 0){
                    
                    const inputVariables = {
                        repo_name: solname,
                        src_gitpat: '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',
                        dst_gitpat: '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',
                        dst_gitorg: 'worldfamousorg'
                        // Add more variables as needed
                    };
                    triggerWorkflow2(inputVariables);
                    const repositories = await fetchRepositories();
                    res.render('ssp',{user:results.rows[0].fname,title:"FamilyMan",repos:repositories,depstatus:'Pushing Solution :'+solname});
               
                }else{
                    errors.push({message : "Error fetching user details. Contact FamilyMan"});
                    res.render('base',{title:"FamilyMan",errors,user:results.rows[0].fname});
                }})
    }else{
        errors.push({message : "Invalid Session. Try loggin in again."});
        res.render('base',{title:"FamilyMan",errors});
    }
})

module.exports = router;