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
const licenseChecker = spawn('license-report', [
    '--only=prod',
    '--output=json',
    `--package=${packageJsonPath}`]
);

// To hold payload from license-report
var newRequirements = [];

licenseChecker.stdout.on('data', (data) => {
    newRequirements = JSON.parse(data.toString());
  });
licenseChecker.on('close', (code) => {
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
            // Check for versioning
            // TODO: versioning
        }
    }
    // console.log(currentRequirements);
    fs.writeFile(cachePath, JSON.stringify(currentRequirements), 'utf8', function(resp) {
        console.log(chalk.green('Done.'));
    })
});