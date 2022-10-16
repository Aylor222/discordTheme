//META{"name":"CustomBackground"}*//

class CustomBackground {

    constructor(){
        this.initRequires();
        this.initConst();
    }

    initRequires() {
        this.fs = require('fs');
        this.path = require('path');
        this.Buffer = require('buffer').Buffer;
    }

    initConst() {
        this.ID_PREFIX = "cb_";
        this.URLS = {
            jquery: `https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js`,
            theme: `https://aylor222.github.io/discordTheme/RandomBackground_theme_core.css`,
            plugin: `https://aylor222.github.io/discordTheme/CoreCustomBackground.js`
        }
        this.IDS = {
            jquery: `${this.ID_PREFIX}jquery`,
            plugin: `${this.ID_PREFIX}core`,
            theme: `${this.ID_PREFIX}cssTheme`,
        }
    }
    

    getAuthor() {return "Aylor";} 
    getDescription() {return "Custom background image or video.";} 
    getName() {return "CustomBackground";} 
    getVersion() {return "1.0.0";} 

    initEvents() {}


    /**
     * Import jquery and the CSS theme for the transparency.
     */
    importScripts() {
        var DEV_local = true; // import local file 

        // If the scripts doesn't exists import them, otherwise skip this part.
        if(document.getElementById(this.IDS.jquery) == null &&
           document.getElementById(this.IDS.css) == null &&
           document.getElementById(this.IDS.plugin) == null) {
            var script_jquery = document.createElement("script"),
                script_core = document.createElement("script"),
                stylesheet = document.createElement("link");

            // id
            script_jquery.id = this.IDS.jquery;
            script_core.id = this.IDS.plugin;
            stylesheet.id = this.IDS.theme;

            // src
            script_core.src = this.URLS.plugin;
            script_jquery.src = this.URLS.jquery;
            stylesheet.href = `data:text/css,` + escape(`@import url("${this.URLS.theme}");`);
            stylesheet.rel = `stylesheet`;

            // append to head
            document.head.appendChild(stylesheet);
            document.head.appendChild(script_jquery);
            document.head.appendChild(script_core);
        }
    }

    load() {
        // Import JS and CSS files
        this.importScripts();
    } 

    start() {
        const that = this;
        setTimeout(() => {
            that.ccb = new CoreCustomBackground();
            that.ccb.start();
            window.ccb = that.ccb;
        }, 4000);


    } 

    stop() {} 

    observer(changes) {} 


    readShortcutLink(path) {
        try {
            const { shell } = require('electron');
            const parsed = shell.readShortcutLink(path);
            return parsed.target;
        }catch(err) {
            return null;
        }
    }

    /**
     * Create missing directory and trigger the callback
     * @param {Function} callback 
     */
     loadDirectory(type, callback) {
        callback(this.path.join(__dirname, `../${type}`));
    }

    /**
     * Read the content of a given file
     */
    readFile(filePath, returnType, callback) {
        const that = this;
        this.fs.readFile(filePath, {encoding: returnType}, function(err, data) {
            console.log(returnType);
            try {
                if(returnType == "base64")
                    callback(data);
                else
                    callback(new Blob([data]));
            } catch (err) {
                console.log(err);
            }
        });
    }
}
