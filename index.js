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

// { Dependencies Object }
var dependencyList = JSON.parse(fs.readFileSync(packageJsonPath))['dependencies'];

for (var packageName of Object.keys(dependencyList)) {
    const packageVersion = dependencyList[packageName]
    if (currentRequirements[packageName] === undefined) {
        /* FORMAT
            "react": {
                "versions": ["16.0.0"]
            }
        */
        currentRequirements[packageName] = {
            "versions": [`${packageVersion}`]
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

fs.writeFile(cachePath, JSON.stringify(currentRequirements), 'utf8', function(resp) {
    console.log(chalk.green('Finished. New dependency file saved.'));
})

return;