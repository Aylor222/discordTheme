//META{"name":"customBackground"}*//
class customBackground {

    constructor(){
        this.fs = require('fs');

        this.availableImages = [];
        this.currentImage = null;
        this.cooldown = 300000;
        this.clock;
        this.initialized = false;

        this.filesFormatAuthorized = [
            ".jpg",
            ".jpeg",
            ".bmp",
            ".tif",
            ".gif",
            ".png"
        ];
    }

    addButtonChangeBackground() {
    	if($("#customBackground_changeBgBtn").length)
    		return;
        const parent = $(".typeWindows-1za-n7");
        const className = "customBackground_changeBg winButtonMinMax-PBQ2gm winButton-iRh8-Z flexCenter-3_1bcw flex-1O1GKY justifyCenter-3D2jYp alignCenter-1dQNNs da-winButtonMinMax da-winButton da-flexCenter da-flex da-justifyCenter da-alignCenter";
        const element = $(`<div id="customBackground_changeBgBtn" class="${className}" onclick="BdApi.getPlugin(\'CustomBackground\').changeBackground()"></div>`);
        parent.append(element);
    }

    addButtonSend() {
        if($("#customBackground_sendBtn").length)
            return;
        const parent = $(".buttons-3JBrkn");
        const className = "button-318s1X icon-3D60ES";
        const element = $(`<div class="buttonContainer-28fw2U da-buttonContainer"><button class="buttonContainer-28fw2U da-buttonContainer"><div id="customBackground_sendBtn" class="${className}" onclick=""></div></button></div>`);
        parent.prepend(element);
    }

    changeBackground() {
        var that = this;
        clearInterval(this.clock);
        this.clock = setInterval(function(){
            that.changeBackground();
        }, this.cooldown);
        this.currentImage = this.availableImages[Math.floor(Math.random()*this.availableImages.length)];
        this.showCurrentImage();
    }

    getName() {return "CustomBackground";} 
    getDescription() {return "Random Background Image";} 
    getVersion() {return "1.1.0";} 
    getAuthor() {return "Aylor";} 

    initEvents() {
        $("body").on("DOMSubtreeModified", ".chat-3bRxxu", function() {
            BdApi.getPlugin("CustomBackground").addButtonSend();
        });
        
    }

    load() {
    } 

    loadDirectory() {
        var that = this;
        var directory = __filename;

        directory = `${directory.substring(0, directory.indexOf("\\plugins"))}\\images\\`;

        // Create folder
        this.fs.access(directory, this.fs.constants.R_OK, (err) => {
            if (err) {
                try {
                    this.fs.mkdir(directory).then(function resolve() {
                        that.loadImages(directory);
                    }).catch(function reject() {});
                } catch (err) {
                    if (err.code !== 'EEXIST') {
                        console.log(`Code Error: ${err.code}`);
                    }
                }
            } else {
                that.loadImages(directory);
            }
        });  
    }

    loadImages(directory) {
        const { resolve } = require('path');
        const { readdir } = require('fs').promises;

        async function* getFiles(dir) {
            const dirents = await readdir(dir, { withFileTypes: true });
            for (const dirent of dirents) {
                const res = resolve(dir, dirent.name);
                if (dirent.isDirectory())
                    yield* getFiles(res);
                else
                    yield res;
            }
        }

        var that = this;
        (async () => {
            for await (const f of getFiles(directory)) {
                console.log(f);
                var regex = (new RegExp(`${this.filesFormatAuthorized.join('|')}$`, 'g'));
                if(regex.test(f.toString()))
                    that.availableImages.push(f);
            }
            // Clock change background every x minutes
            this.changeBackground();
        })();
    }


    showCurrentImage() {
        this.fs.readFile(this.currentImage, function(err, data) {
            var base64data = new Buffer(data).toString('base64');
            $("#app-mount").css("background-image",`url(data:image/png;base64,${base64data})`);
        });
    }

    start() {
        if(!this.initialized) {
            this.initialized = true;

            // Load existing img from folder, then start a clock to change the background every x minutes
            this.loadDirectory();
            this.initEvents();
        }
        var that = this;
        setTimeout(function() { // Timeout to let the page load.
            that.addButtonChangeBackground();
        }, 2000);
    } 
    stop() {} 

    observer(changes) {} 
}
