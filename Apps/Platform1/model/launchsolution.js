const {Octokit} = require("octokit")

const config = require('../config/envconfig')();

async function FetchFileContent(reponame,fn) {
    const octokit = new Octokit({
        auth: process.env.GITKEY
    })
    
    filecont=await octokit.request('GET /repos/{owner}/{repo}/contents/{file}', {
        owner: process.env.GITORG ,
        repo: reponame,
        file : "variables.tf",
        headers: {
        'accept' : 'application/vnd.github.object+json',
        'X-GitHub-Api-Version': '2022-11-28'
        }
    })
    fn(Buffer.from(filecont.data.content, 'base64').toString('ascii'))
        
}

module.exports = {
    FetchFileContent
};

