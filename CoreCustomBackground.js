


var CoreCustomBackground = class {

    constructor(){
        this.initRequires();
        this.initConst();
        this.plugin = BdApi.Plugins.get("CustomBackground").instance;

        this.availableImages = [];
        this.availableVideos = [];
        this.cooldown_IMG = 300000;
        this.cooldown_VID = 0;
        this.clock_IMG;
        this.clock_VID;
        this.currentImage;
        this.currentVideo;
    }

    initRequires() {
        this.fs = require('fs');
    }

    initConst() {
        this.CONST = {
            imgFolder: "images",
            vidFolder: "videos",
            filesFormatAuthorized_IMG: [
                    ".jpg",
                    ".jpeg",
                    ".webp",
                    ".bmp",
                    ".tif",
                    ".gif",
                    ".png"
                ],
            filesFormatAuthorized_VID: [
                    ".mkv",
                    ".mp4",
                    ".ts",
                    ".webm"
                ]
        }
    }


    /**
     * Add a button in the top right of the screen.
     * Clicking on it will open the plugin's menu.
     */
     addButtonShowMenu() {
    	if($("#customBackground_changeBgBtn").length)
    		return;
        const parent = $(".typeWindows-3ILlhq");
        const className = "customBackground_menu winButtonMinMax-3RsPUg winButton-3UMjdg flexCenter-1Mwsxg flex-3BkGQD justifyCenter-rrurWZ alignCenter-14kD11";
        const element = $(`<div id="customBackground_changeBgBtn" class="${className}" onclick="BdApi.Plugins.get('CustomBackground').instance.ccb.showMenu()"></div>`);
        parent.append(element);
    }

    /**
     * Select a new image to display in the background from the available list of file.
     */
     changeBackground_IMG() {
        var that = this;
        clearInterval(this.clock_IMG);
        if(this.cooldown_IMG > 0)
            this.clock_IMG = setInterval(function(){
                that.changeBackground_IMG();
            }, this.cooldown_IMG);
        this.currentImage = this.availableImages[Math.floor(Math.random()*this.availableImages.length)];
        this.showCurrentImage();
    }

    /**
     * Select a new video to display in the background from the available list of file.
     */
    changeBackground_VID() {
        var that = this;
        clearInterval(this.clock_VID);

        if(this.cooldown_VID > 0)
            this.clock_VID = setInterval(function(){
                that.changeBackground_VID();
            }, this.cooldown_VID);
        this.currentVideo = this.availableVideos[Math.floor(Math.random()*this.availableVideos.length)];
        this.showCurrentVideo();
    }

    /**
     * Get the path for the image directory.
     * Load all compatible images files from the folder into the array variable : availableImages
     */
     loadDirectory_IMG() {
        const that = this;
        return new Promise(function(resolve) {
            that.plugin.loadDirectory(that.CONST.imgFolder, (directory) => {
                that.loadFiles(that, 
                                "availableImages",
                                directory,
                                that.CONST.filesFormatAuthorized_IMG,
                                () => {resolve()});
            });
        });
    }

    /**
     * Get the path for the videos directory.
     * Load all compatible videos files from the folder into the array variable : availableVideos
     */
    loadDirectory_VID() {
        const that = this;
        return new Promise(function(resolve) {
            that.plugin.loadDirectory(that.CONST.vidFolder, (directory) => {
                that.loadFiles(that, 
                                "availableVideos",
                                directory,
                                that.CONST.filesFormatAuthorized_VID,
                                () => {resolve()});
            });
        });
    }

    /**
     * Loop the given directory to collect compatible files an put them in the given array variable
     * @param {String} arrayName // Name of the array variable
     * @param {String} directory
     * @param {Array Of String} filesFormatAuthorized
     * @param {Function} callback
     */
     loadFiles(that, arrayName, directory, filesFormatAuthorized, callback) {
        that[arrayName] = [];

        const { resolve } = require('path');

        async function* getFiles(dir) {
            const dirents = [...that.fs.readdirSync(dir, { withFileTypes: true })];
            for (const dirent of dirents) {
                const res = resolve(dir, dirent.name);
                if (dirent[Object.getOwnPropertySymbols(dirent)[0]]  == 2) // isDirectory
                    yield* getFiles(res);
                else
                    yield res;
            }
        }

        (async () => {
            for await (const f of getFiles(directory)) {
                var regex = (new RegExp(`${filesFormatAuthorized.join('|')}$`, 'g'));
                if(regex.test(f.toString())) {

                    if(f.endsWith(".lnk")) {
                        let realPath = that.plugin.readShortcutLink(f);
                        if(realPath != null)
                            that[arrayName].push(realPath);
                    } else 
                        that[arrayName].push(f);
                }
            }
            callback();
        })();
    }


    disable_IMG() {
        $("#app-mount").css({'background-image' : ''});
        clearInterval(this.clock_IMG);
    }
    disable_VID() {
        try {
            var videoElement = document.getElementById("rd_bg_plugin");
            videoElement.pause();
            videoElement.removeAttribute("src");
            videoElement.load();
        } catch (ignored) {}
        try {
            var videoElementTemp = document.getElementById("rd_bg_plugin_temp");
            videoElementTemp.pause();
            videoElementTemp.removeAttribute("src");
            videoElementTemp.load();;
        } catch (ignored) {}

        $("#rd_bg_plugin").remove();
        $("#rd_bg_plugin_temp").remove();
        clearInterval(this.clock_VID);
    }


    
    /**
     * Display in background the current image in memory.
     */
     showCurrentImage() {
         this.addButtonShowMenu();
         this.plugin.readFile(this.currentImage, "base64", function(base64data) {
            $("#app-mount").css("background-image",`url(data:image/png;base64,${base64data})`);
        });
    }
    
    /**
     * Display in background the current video in memory.
     */
     showCurrentVideo() {
        this.addButtonShowMenu();
        this.plugin.readFile(this.currentVideo, "utf8", function(blob) {
            let url = window.URL.createObjectURL(blob);
            setTimeout(() => {
                URL.revokeObjectURL(blob);
                blob = null;
                url = null;
            }, 10 * 60 * 1000);

            if($("#rd_bg_plugin_temp").length == 0) {
                $("#app-mount").prepend(`<video id="rd_bg_plugin_temp" muted loop autoplay="autoplay" src="${url}" style="display=none;"></video>`);
            }
            const videoHolder = $("#rd_bg_plugin_temp");
            
            videoHolder.on("timeupdate", function() {
                var tmpVideoHolder = $("#rd_bg_plugin_temp");
                if(tmpVideoHolder.currentTime < 0.5  || tmpVideoHolder.length == 0)
                    return;
                tmpVideoHolder.css("display", "initial");
                
                // Create an interval to display the next video when the current one end.
                var vidElement = document.getElementById("rd_bg_plugin_temp");
                vidElement.addEventListener("loadedmetadata", (event) => {
                    let duration = !isNaN(vidElement.duration) ? vidElement.duration : 300;
                    BdApi.Plugins.get("CustomBackground").instance.ccb.clock_VID = setInterval(function(){
                        if($("#customBackground_contentVid_activate").prop("checked")) {
                           if (BdApi.Plugins.get("CustomBackground").instance.ccb.cooldown_VID <= 0)
                                BdApi.Plugins.get("CustomBackground").instance.ccb.changeBackground_VID();
                        } else {
                            BdApi.Plugins.get("CustomBackground").instance.ccb.disable_VID();
                        }
                    }, duration * 1000);
                });

                // Remove old video
                try {
                    var videoElement = document.getElementById("rd_bg_plugin");
                    videoElement.pause();
                    videoElement.removeAttribute("src");
                    videoElement.load();
                } catch (ignored) {}

                $("#rd_bg_plugin").remove();

                // Override id
                tmpVideoHolder.attr("id", "rd_bg_plugin");
            });
            document.getElementById("rd_bg_plugin_temp").load();
        });
    }


    /**
     * Display the plugin's menu or build the menu if it doesn't exist yet
     */
     showMenu() {
        const menu = $("#customBackground_mainMenu");
        if(menu.length == 0) {
            // build the menu
            const parent = $("#app-mount"),
                  element = `<div id="customBackground_mainMenu">
                    <div id="customBackground_mainMenu_contentImg" class="customBackground_mainMenu_content">
                        <h2>Images</h2>
                        <div class="holder">
                            <input id="customBackground_contentImg_activate" type="checkbox" checked="true" title="Enable/Disable image background">
                            <div id="customBackground_contentImg_nextBg" class="icon customBackground_next" title="Display a random video"></div>
                            <div id="customBackground_contentImg_refresh" class="icon customBackground_refresh" title="Refresh the list of videos"></div>
                        </div>
                    </div>
                    <div id="customBackground_mainMenu_contentVid" class="customBackground_mainMenu_content">
                        <h2>Videos</h2>
                        <div class="holder">
                            <input id="customBackground_contentVid_activate" type="checkbox" title="Enable/Disable video background">
                            <div id="customBackground_contentVid_nextBg" class="icon customBackground_next" title="Display a random video"></div>
                            <div id="customBackground_contentVid_refresh" class="icon customBackground_refresh" title="Refresh the list of videos"></div>
                        </div>
                    </div>
                  </div>`;
            parent.append(element);
            // Image
            $("#customBackground_contentImg_activate").change(function() {
                if(this.checked)
                    BdApi.Plugins.get("CustomBackground").instance.ccb.changeBackground_IMG();
                else
                    BdApi.Plugins.get("CustomBackground").instance.ccb.disable_IMG();
            });
            $("#customBackground_contentImg_nextBg").click(() => {
                $('#customBackground_contentImg_activate').prop("checked", true);
                BdApi.Plugins.get("CustomBackground").instance.ccb.changeBackground_IMG();
            });
            $("#customBackground_contentImg_refresh").click(() => {BdApi.Plugins.get("CustomBackground").instance.ccb.loadDirectory_IMG();});
            // Videos
            $("#customBackground_contentVid_activate").change(function() {
                if(this.checked)
                    BdApi.Plugins.get("CustomBackground").instance.ccb.changeBackground_VID();
                else
                    BdApi.Plugins.get("CustomBackground").instance.ccb.disable_VID();
            });
            $("#customBackground_contentVid_nextBg").click(() => {
                $('#customBackground_contentVid_activate').prop("checked", true);
                BdApi.Plugins.get("CustomBackground").instance.ccb.changeBackground_VID();
            });
            $("#customBackground_contentVid_refresh").click(() => {BdApi.Plugins.get("CustomBackground").instance.ccb.loadDirectory_VID();});
        } else {
            if(menu.css("display") == "block")
                menu.css("display", "none");
            else
                menu.css("display", "block");
        }
    }

    start() {
        // Load existing img from folder, then start a clock to change the background every x minutes
        const that = this;
        this.loadDirectory_IMG().then(() => {
            this.loadDirectory_VID().then(() => {
                this.addButtonShowMenu();
                this.startClock();
            });
        });

        // Refresh the button every hour in case Discord update the page and removes it.
        setInterval(() => {
            that.addButtonShowMenu(); 
        }, 1000 * 60 * 60);
    }

    startClock() {
       this.changeBackground_IMG();
    }

}
