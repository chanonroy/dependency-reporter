var fs = require('fs');
const chalk = require('chalk');
const { spawn } = require('child_process');
var cachePath = './dependencies.json'
var currentRequirements = {};

// Obtain path for desired package.json file
if (process.argv[2] == undefined) {
    console.log(chalk.red('Please specify a path for a package.json file'));
    return;
}
var packageJsonPath = process.argv[2];

// Load previous cached list of packages (if exists)
if (fs.existsSync(cachePath)) {
    currentRequirements = JSON.parse(fs.readFileSync(cachePath));
    console.log(chalk.green('Loaded previously saved dependencies file'));
};

// Get list of packages and only take values that we want
const licenseCheckerProcess = spawn('license-report', [
    '--only=prod',
    '--output=json',
    `--package=${packageJsonPath}`]
);

// To hold payload from license-report
var newRequirements = [];

licenseCheckerProcess.stdout.on('data', (data) => {
    newRequirements = JSON.parse(data.toString());
  });
licenseCheckerProcess.on('close', (code) => {
    for (var p in newRequirements) {
        // Get values that we need from license-report
        const package = newRequirements[p];
        const packageName = package.name;
        const packageVersion = package.comment;
        const packageLink = package.link;

        if (currentRequirements[packageName] === undefined) {
            // Add to requirements list 
            /* FORMAT
                "react": {
                    "versions": ["16.0.0"],
                    "link": "git+https://github.com/facebook/react"
                }
            */
           currentRequirements[packageName] = {
                "versions": [`${packageVersion}`],
                "link": `${packageLink}`
            }
            console.log('Added ' + chalk.yellow(packageName) + ' to dependency list ...');
        } else {
            // Add additional version (if needed)
            if (!currentRequirements[packageName].versions.includes(packageVersion)) {
                currentRequirements[packageName].versions.push(packageVersion);
                console.log('Added ' + chalk.cyan(packageVersion) + ' to version list ...');
            }
        }
    }
    // console.log(currentRequirements);
    fs.writeFile(cachePath, JSON.stringify(currentRequirements), 'utf8', function(resp) {
        console.log(chalk.green('Finished. New dependency file saved.'));
    })
});