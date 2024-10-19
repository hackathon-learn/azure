const config = require('../config/envconfig')();
const axios = require('axios');
const { now } = require('moment');


async function getAllWorkspaces(organization) {
    const authToken = process.env.TFTEAMKEY;
    const apiUrl = `https://app.terraform.io/api/v2/organizations/${organization}/workspaces`;

    try {
        const response = await axios.get(apiUrl, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching workspaces:', error);
        return "Error fetching workspaces";
    }
}

async function getWorkspaceRuns(workspaceid) {
    const authToken = process.env.TFTEAMKEY;
    const apiUrl = `https://app.terraform.io/api/v2/workspaces/${workspaceid}/runs`;

    try {
        const response = await axios.get(apiUrl, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching workspace runs:', error);
        return "Error fetching deployments";
    }
}


async function FetchWSRuns(fn) {
    const organization = 'WorldfamousOrg';
    let retarray = [];
    let deployments ;
    
    await getAllWorkspaces(organization)
        .then(async data => {
            if (data) {
                await data.data.forEach( async workspace => {
                    runs = await getWorkspaceRuns(`${workspace.id}`);
                    const tempobj = {
                        ws_name: `${workspace.attributes.name}`,
                        ws_id: `${workspace.id}`,
                        ws_status: runs.data[0].attributes.status,
                        ws_update: runs.data[0].attributes['updated-at']
                    };
                    retarray.push(tempobj);
                });
                console.log(retarray);
            } 
            
        });

    
    fn(retarray);
}

module.exports = {
    FetchWSRuns
};