//META{"name":"customBackground"}*//
class customBackground {

    constructor(){
        this.availableImages = [];
        this.cooldown = 300000;
        this.clock;
        this.fs = require('fs');
        this.initialized = false;
    }

    addButtonChangeBackground() {
    	if($("#customBackground_changeBgBtn").length)
    		return;
       	var parent = $(".typeWindows-1za-n7");
    	var className = "customBackground_changeBg winButtonMinMax-PBQ2gm winButton-iRh8-Z flexCenter-3_1bcw flex-1O1GKY justifyCenter-3D2jYp alignCenter-1dQNNs da-winButtonMinMax da-winButton da-flexCenter da-flex da-justifyCenter da-alignCenter";
		var element = $('<div id="customBackground_changeBgBtn" class="' + className + '" onclick="bdplugins.custom_background.plugin.changebackground()"></div>');
    	parent.append(element);
    }

    changebackground() {
    	this.changeBackground();
    }

    changeBackground() {
        var that = this;
        clearInterval(this.clock);
        this.clock = setInterval(function(){
            that.changeBackground();
        }, this.cooldown);
        this.fs.readFile(this.availableImages[Math.floor(Math.random()*this.availableImages.length)], function(err, data) {
            var base64data = new Buffer(data).toString('base64');
            $("#app-mount").css("background-image","url(data:image/png;base64," + base64data + ")");
        });
    }

    getName() {return "CustomBackground";} 
    getDescription() {return "Random Background Image";} 
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

    loadImages(directory) {
        this.fs.readdir(directory, (err, files) => {
        	//if more images has been added since last clock cycle -> add to cache
        	if(this.availableImages.length == files.length)
        		return;

        	this.availableImages = [];
            files.forEach(file => {
                // jpg, png
                if(file.toString().endsWith(".jpg") || file.toString().endsWith(".png"))
                    this.availableImages.push(directory + file);
            });
            // Clock change background every x minutes
            this.changeBackground();
        });
    }

    start() {
        if(!this.initialized) {
            this.initialized = true;

            // Load existing img from folder, then start a clock to change the background every x minutes
            this.loadDirectory();
        }
        var that = this;
        setTimeout(function() {
        	that.addButtonChangeBackground();
        }, 2000);
    } 
    stop() {} 

    observer(changes) {} 
}
