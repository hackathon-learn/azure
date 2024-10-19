const {Octokit} = require("octokit")
const config = require('../config/envconfig')();

async function FetchRepo(fn) {
    const octokit = new Octokit({
        auth: process.env.GITKEY
    })
    
    repo=await octokit.request('GET /orgs/{org}/repos', {
        org: process.env.GITORG,
        headers: {
        'X-GitHub-Api-Version': '2022-11-28',
        'Accept' : 'application/vnd.github+json'
        }
    })
    fn(repo)
}

module.exports = {
    FetchRepo
};