const config = require('../config/envconfig')();
const {Octokit} = require("octokit")
const moment = require('moment');

const apiUrl = 'https://app.terraform.io/api/v2/organizations/'+process.env.TFORG+'/workspaces';

const fs = require('fs');
const tar = require('tar');
const path = require('path');
const { Console } = require("console");

function replaceWordInFile(filePath, oldWord, newWord) {
  // Read the contents of the file
  let fileContent = fs.readFileSync(filePath, 'utf8');

  // Replace the word
  fileContent = fileContent.replace(new RegExp(oldWord, 'g'), newWord);

  // Write the modified content back to the file
  fs.writeFileSync(filePath, fileContent, 'utf8');

  console.log(`Word "${oldWord}" replaced with "${newWord}" in file ${filePath}`);
}

async function CreateWS(reponame,allvariable,fn) {
    const formattedDateTime = moment().format('YYYYMMDDHHmmss');
    const data = {
        "data": {
          "attributes": {
            "name": reponame+"-"+formattedDateTime
          },
          "relationships": {
            "project": {
              "data": {
                "type": "projects",
                "id": process.env.TFPROJECTID
              }
            }
          },
          "type": "workspaces"
        }
      }
    
    const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/vnd.api+json',
          'Authorization': `Bearer ${process.env.TFORGKEY}`
        },
        body: JSON.stringify(data)
    };
    
    fetch(apiUrl, requestOptions)
    /*.then(response => {
        if (!response.ok) {
             fn("Not Created")
        }
    })*/
    .then(response => response.json())
    .then(data => {
      console.log('Workspace ID:', data.data.id);
      DownloadRepo(reponame,data.data.id,allvariable,function(ret){
        fn(ret)
      }) 
    })
    .catch(error => {
      console.error('Error creating workspace:', error);
    });
}

async function DownloadRepo(reponame,wsid,allvariable,fn) {
  const octokit = new Octokit({
      auth: process.env.GITKEY
  })
  
  filecont=await octokit.request('GET /repos/{owner}/{repo}/tarball', {
    owner: process.env.GITORG,
    repo: reponame,
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    }
  })

  const tarFilePath = reponame+'.tar';
  fs.writeFileSync(tarFilePath, Buffer.from(filecont.data));
  let extractedFolderName = '';
  const destinationDirectory = './';
  const tarFileStream = fs.createReadStream(tarFilePath);
  tarFileStream.pipe(tar.x({
    C: destinationDirectory
  }))
  .on('error', (err) => {
    console.error('Extraction error:', err);
  })
  .on('entry', (entry) => {
    if (!extractedFolderName) {
      extractedFolderName = path.basename(entry.path);
    }
  })
  .on('end', () => {
    console.log('Extraction complete.', extractedFolderName);
    fs.unlink(reponame+'.tar', (err) => {
      if (err) {
        console.error('Error deleting file:', err);
        return;
      }
      replaceWordInFile(extractedFolderName+"/main.tf", "familyman", "worldfamousorg");
      fs.writeFileSync(extractedFolderName+"/terraform.auto.tfvars",'','utf8')
      
      for (const key in allvariable) {
        if (allvariable.hasOwnProperty(key)) {
          if (key != "reponame" ) {
            const value = allvariable[key];
            variable = `${key} ="${value}"`;
            fs.appendFileSync(extractedFolderName+"/terraform.auto.tfvars", variable , 'utf8');
            fs.appendFileSync(extractedFolderName+"/terraform.auto.tfvars", '\n' , 'utf8');
          }
        }
    }

      const srcfolderPath = extractedFolderName;
      const finaltarFilePath = reponame+".tar";
      tar.c(
        {
          gzip: true,
          file: finaltarFilePath,
          cwd: srcfolderPath,
        },
        fs.readdirSync(srcfolderPath)
      ).then(() => {
        console.log('Folder contents tarred successfully!');

        fs.rm(extractedFolderName,{ recursive: true }, (err) => {
          if (err) {
            console.error('Error deleting file:', err);
            return;
          }
        })
      }).catch((err) => {
        console.error('Error while tarring folder contents:', err);
      });
    })


    
  });
  
  GenUploadWSlink(reponame,wsid,reponame+".tar",fn)
  fn("Downloaded & Extracted & Ready for TF"+extractedFolderName)
}


async function GenUploadWSlink(reponame,wsid,tarfile,fn) {
  const data = {
    "data": {
      "type": "configuration-versions",
      "attributes": {
        "auto-queue-runs": true
      }
    }
  };
    
  const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.api+json',
        'Authorization': `Bearer ${process.env.TFTEAMKEY}`
      },
      body: JSON.stringify(data)
  };
  apiUrlWSLink = "https://app.terraform.io/api/v2/workspaces/"+wsid+"/configuration-versions"
  fetch(apiUrlWSLink, requestOptions)
  .then(response => response.json())
  .then(data => {
    CreateDeployment(tarfile,data.data.attributes['upload-url'],fn)
  })
  .catch(error => {
    console.error('Error fetching upload link:', error);
  });
}

async function CreateDeployment(tarfile,upldlink,fn) {
  const fileData = fs.readFileSync(tarfile);
  const requestOptions = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/octet-stream'
      },
      body: fileData
  };
  await fetch(upldlink, requestOptions)
  .then(response  => {
    return response.text().then(data => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    });
  })

.catch(error => {
  console.error('Error:', error);
});
  
}

module.exports = {
    CreateWS
};