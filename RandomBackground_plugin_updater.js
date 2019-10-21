//META{"name":"RandomBackgroundCore"}*//

class RandomBackgroundCore {

    constructor(){
        this.fs = require('fs');
        this.https = require('https');
        this.path = require('path');
        this.request = require('request');

        this.pluginFileName = this.path.join(__dirname,"RandomBackground.plugin.js");
        this.pluginURL = "https://aylor222.github.io/discordTheme/RandomBackground_plugin_core.js";
        this.pluginVersionURL = "https://aylor222.github.io/discordTheme/RandomBackground_plugin_version.json";

        this.initialized = false;
    }

    /**
     * Check if the plugin is up to date.
     */
    checkLastVersion() {
        var that = this;
        return new Promise(function(resolve, reject) {
            that.request(that.pluginVersionURL, function (err, response, body) {
                if (!err && response.statusCode == 200) {
                    var importedJSON = JSON.parse(body);
                    that.fs.access(that.pluginFileName, that.fs.constants.R_OK, (err) => {
                        if (!err) {
                            resolve(importedJSON.version == bdplugins.CustomBackground.plugin.getVersion());
                        } else 
                            resolve(false);
                    }); 
                } else {
                    reject(err);
                }
            })
        });
    }

    /**
     * Create a backup file for the plugin
     */
    createBackup() {
        var that = this;
        return new Promise(function(resolve, reject) {
            that.fs.access(that.pluginFileName, that.fs.constants.R_OK, (err) => {
                if (!err) {
                    that.fs.rename(that.pluginFileName, `${that.pluginFileName}.bak`, function(err) {
                        if (err)
                            reject(err);
                        else
                            resolve();
                    });
                } else 
                   resolve();
            }); 
        });
    }

    /**
     * Update the plugin
     * 1 - Create a backup
     * 2 - Download the new file
     * 3 - Write the new file
     * 4 - Delete the backup file
     */
    doUpdate() {
        this.createBackup().then(()=> {
            const file = this.fs.createWriteStream(this.pluginFileName);
            const request = this.https.get(this.pluginURL, function(res) {
                res.pipe(file);
                file.on('finish', function(){ 
                    console.log("Update complete");
                });
            });
        }).catch((err) => {
            console.log(err);
        });
    }


    getName() {return "RandomBackgroundCore";} 
    getDescription() {return "Auto updater for the plugin RandomBackground";} 
    getVersion() {return "1.0.0";} 
    getAuthor() {return "Aylor";} 

    load() {
    } 

    loadDirectory() {
        var that = this;
        var directory = __filename;

        directory = directory.substring(0, directory.indexOf("\\plugins")) + "\\images\\";

        // Create folder
        this.fs.access(directory, this.fs.constants.R_OK, (err) => {
            if (err) {
                try {
                    this.fs.mkdir(directory).then(function resolve() {
                        that.loadImages(directory);
                    }).catch(function reject() {});
                } catch (err) {
                    if (err.code !== 'EEXIST') {
                        console.log("Code Error: " + err.code);
                    }
                }
            } else {
                that.loadImages(directory);
            }
        });  
    }


    start() {
        if(!this.initialized) {
            var that = this;
            
            this.initialized = true;

            // Check last version available.
            this.checkLastVersion().then((isUpToDate) => {
                if(!isUpToDate)
                    that.doUpdate();
            }).catch((err) => {
                // ToDo
                console.log(err);
            });
        }
    } 
    stop() {} 

    observer(changes) {} 
}