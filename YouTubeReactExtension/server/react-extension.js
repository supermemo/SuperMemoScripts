// define a new console
//IE detection
var isIE = false || !!document.documentMode;
if (isIE) {
    var console=(function(oldCons){
        var oLog = document.getElementById("log");
        return {
            log: function(text){
                //oldCons.log(text);
                oLog.innerHTML += '[LOG] ' + text + '\n';                    
            },
            info: function (text) {
                //oldCons.info(text);
                // Your code
                oLog.innerHTML += '[INFO] ' + text + '\n';                    
            },
            warn: function (text) {
                //oldCons.warn(text);
                // Your code
                oLog.innerHTML += '[WARN] ' + text + '\n';
                //alert( '[WARN] ' + text + '\n')                
            },
            error: function (text) {
                //oldCons.error(text);
                // Your code
                oLog.innerHTML += '[ERROR] ' + text + '\n';                    
            }
        };
    }(window.console));

    //Then redefine the old console
    window.console = console;

    window.onerror = function myErrorHandler(errorMsg, url, lineNumber) {
        // Log the error here -- perhaps using an AJAX call
        console.error(errorMsg);
        return true;
    }
}

function callAjax(url, callback){
    var xmlhttp;
    // compat IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function(){
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
            callback(xmlhttp.responseText);
        }
    }
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

//TODO state loading
state = {
    url: null,
    pip: false,
    playing: true,
    controls: false,
    light: false,
    volume: 0.8,
    muted: false,
    played: 0,
    loaded: 0,
    duration: 0,
    playbackRate: 1.0,
    loop: false
}

RPC_IP = "localhost";
RPC_PORT = "13000";
WS_NAME = "jukebox";
registered = false;
betweenRedirect = false;
iframeReady = false;
registerQueue = [];
iframeQueue = [];
ws = null;
PLAYER_IFRAME_ID = "widget2";
ACCEPTABLE_ORIGINS = ["http://localhost:8000", "https://www.youtube.com"]

function imposeBoundaries(value, updateElement){
    document.getElementById('imposeboundries').value = value; 
    proxySync('syncElement', ["imposeboundries", value]);

    if(updateElement){
        updateBorder(updateElement);
    }
}

function setAt(type, offset, sync) {
    var oAt,
        iCurrTime = 0,
        iDuration = 0;

    if (ytplayer) {
        iCurrTime = parseInt(ytplayer.getCurrentTime());
        iDuration = parseInt(ytplayer.getDuration());
        oAt = document.getElementById(type + "videoat");
        var cur = convertDuration2HHMMSS(iCurrTime + offset);
        oAt.value = cur;

        if(sync)
            proxySync('syncElement', [type + "videoat", cur]);

        if (type != "resume") {
            imposeBoundaries(0, oAt);
        }
    }
}

//sets the *videat to either 0 or current play time
function resetAt(type) {
    var oAt = document.getElementById(type + "videoat"),
        iAt;
    //console.warn("setting " + type + "videoat, cur: " + oAt.value) 
    switch (type) {
        case "resume":
        case "start":
            //console.warn("   to zero.")
            iAt = 0;
            break;

        case "stop":
            if (ytplayer) {
                //console.warn( "    to the duration: " + ytplayer.getDuration())
                iAt = parseInt(ytplayer.getDuration());
            }
            break;
    }

    var conv = convertDuration2HHMMSS(iAt);
    oAt.value = conv
    proxySync('syncElement', [type + "videoat", conv]);

    oAt.style.border = "2px inset";
}

//cosmetic
function updateBorder(inputText) {
    var sBorderCl = "",
        iNewVal = convertHHMMSS2Duration(inputText.value);

    switch (inputText.id.replace(/videoat/, "")) {
        case "start":
            if (iNewVal > 0) {
                sBorderCl = "blue";
            }
            break;

        case "stop":
            // TODO use of internal player discouraged
            if (ytplayer.getInternalPlayer()) {
                if (ytplayer.getInternalPlayer().getPlayerState() >= 1) {
                    if (iNewVal < parseInt(ytplayer.getDuration())) {
                        sBorderCl = "blue";
                    }
                }
            }
            break;
    }

    if (sBorderCl.length) {
        inputText.style.border = "2px solid " + sBorderCl;
        proxySync('syncBorder', [inputText.id, "2px solid " + sBorderCl]);
    } else {
        inputText.style.border = "2px inset";
        proxySync('syncBorder', [inputText.id, "2px inset"]);
    }
}

function handlePlayerReady(player) {
    betweenRedirect = false;
    ytplayer = player;
    playerElem = document.getElementById("bideo")

    if (1 == document.getElementById("imposeboundries").value) {
        seekVideo("start");
    } else {
        seekVideo("resume");
    }
    checkBoundaries();
}

function handlePlay(){
    oFeedbackOuter = document.getElementById("feedbackOuter");
    if ("block" == oFeedbackOuter.style.display) {
        oFeedbackOuter.style.display = "none";
        document.getElementById("feedbackInner").innerHTML = "";
        proxySync('syncInnerHTML', ["feedbackInner", ""]);
    }
}

function handlePause(){
    imposeBoundaries(0, undefined);
}

var arrowListener = function (e) {
    e = e || window.event;

    var keyCode = e.keyCode || e.which;

    //up
    var type = e.target.id.replace("videoat","");
    if(keyCode=='38'){
        move(type, 'forward'); 
        e.preventDefault();
        return false;
    } else if (keyCode=='40'){
        move(type, 'rewind');
        e.preventDefault();
        return false;
    }        
}


function seekVideo(to) {
    if (ytplayer) {
        //console.log('seeking from ' + ytplayer.getCurrentTime() + ' to ' + convertHHMMSS2Duration(document.getElementById(to + "videoat").value))
        ytplayer.seekTo(convertHHMMSS2Duration(document.getElementById(to + "videoat").value), 'seconds');
    }
}

function pausePlayer () {
    //TODO state dynamically
    //renderReactPlayer(container, { url:url, playing: false })
    if(ytplayer.getInternalPlayer()){
        ytplayer.getInternalPlayer().pauseVideo();
        return true;
    }
    return false;
}

function playPlayer () {
    //TODO state dynamically
    //renderReactPlayer(container, { url:url, playing: true })
    if(ytplayer.getInternalPlayer()){
        ytplayer.getInternalPlayer().playVideo();
        return true;
    }
    return false;
}

function resumeVideo() {
    if (ytplayer) {
        playPlayer();
        seekVideo('resume');
    }
}

function testExtract() {
    if (ytplayer) {
        playPlayer();
        seekVideo("start");
        imposeBoundaries(1, undefined);
    }
}

function resetExtract() {
    if (ytplayer) {
        imposeBoundaries(0, undefined);
        resetAt("start");
        resetAt("stop");
    }
}

function addExtract(offset) {
    if(offset < 0){
        setAt("start", offset, false);
        setAt("stop", 0, false);
    } else if (offset > 0){
        setAt("start", 0, false);
        setAt("stop", offset);
    }

    var oCustomPromptVisible = document.getElementById("customPromptVisible"),
        oExtracts = document.getElementById("extracts"),
        iNextExtractNo = (!oExtracts.options.length) ? 1 : oExtracts.options.length + 1,
        sExtractName = "Extract #" + iNextExtractNo;

    oCustomPromptVisible.value = 1;

    if (oCustomPromptVisible.value == 1) {
        document.getElementById("extractName").value = sExtractName;

        oCustomPrompt.show();

        oRKeyListener.disable();
        oFKeyListener.disable();

        pausePlayer();
    }
}

function feedExtractChange(index) {
    var oExtracts = document.getElementById("extracts");
    var new_opt = oExtracts.options[index];

    if(new_opt){
        new_opt.selected = true;
    } else {
        console.warn("no option at index " + index, " resetting to first one")
        oExtracts.options[0].selected = true;
    }

    if("createEvent" in document) {
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent("change", false, true);
        oExtracts.dispatchEvent(evt);
    } else {
        oExtracts.fireEvent("onchange");
    }
}

// carry out seek based on selected extract option
function feedCurrentExtract(e) {
    var oEvent = YAHOO.util.Event.getEvent(e),
        oSelect = document.getElementById("extracts"),
        sCurrentExtract = "",
        aCurrentExtract = [],
        oStartAt = document.getElementById("startvideoat"),
        oStopAt = document.getElementById("stopvideoat");

    proxySync('syncExtractsSelect', ["extracts", oSelect.selectedIndex]);

    //only continue onchange
    if ((oSelect.options.length > 1) && (oEvent.type == "click")) {
        YAHOO.util.Event.stopEvent(oEvent);
        return;
    }

    sCurrentExtract = oSelect.options[oSelect.selectedIndex].value;
    aCurrentExtract = sCurrentExtract.split(" - ");
    //console.log("e Overwriting start " + oStartAt.value + "->" + aCurrentExtract[0])
    oStartAt.value = aCurrentExtract[0];
    proxySync('syncElement', ["startvideoat", aCurrentExtract[0]]);
    updateBorder(oStartAt);
    oStopAt.value = aCurrentExtract[1];
    proxySync('syncElement', ["stopvideoat", aCurrentExtract[1]]);
    //console.log("e Overwriting stop " + oStopAt.value + "->" + aCurrentExtract[1])
    updateBorder(oStopAt);
    if (ytplayer) {
        playPlayer();
    }
    seekVideo("start");
    imposeBoundaries(1, undefined);
    oSelect.blur();
}

function removeCurrentExtract() {
    proxySync('syncExtractsRemove', ["extracts"]);
    
    var oExtracts = document.getElementById("extracts"),
        oCurrentExtract = oExtracts.options[oExtracts.selectedIndex];

    oExtracts.options[oExtracts.selectedIndex] = null;
    if (oExtracts.options.length) {
        oExtracts.selectedIndex = oExtracts.options.length - 1;
    } else {
        oExtracts.disabled = true;
        document.getElementById("removeCurrentExtract").style.background = "transparent url(http://localhost:8000/iv/images/icons.png) no-repeat -96px 0";
    }
}

function goTo(type) {
    if (ytplayer) {
        playPlayer();
        seekVideo(type);
        imposeBoundaries(0, undefined);
    }
}

function move(type, where) {
    var oAt = document.getElementById(type + "videoat"),
        iOldVal = convertHHMMSS2Duration(oAt.value),
        iNewVal = 0,
        iMaxVal = 0;

    if (ytplayer) {
        iMaxVal = parseInt(ytplayer.getDuration());
    }

    switch (where) {
        case "rewind":
            iNewVal = iOldVal - iSecs;
            if (iNewVal <= 0) {
                iNewVal = 0;
            }
            if (iNewVal > iMaxVal) {
                iNewVal = iMaxVal;
            }
            break;

        case "forward":
            iNewVal = iOldVal + iSecs;
            if (iNewVal >= iMaxVal) {
                iNewVal = iMaxVal;
            }
            if (iNewVal < 0) {
                iNewVal = 0;
            }
            break;
    }

    var conv = convertDuration2HHMMSS(iNewVal);
    oAt.value = conv
    proxySync('syncElement', [type + "videoat", conv]);
    
}

//keep player progress within learning boundaries
function checkBoundaries() {
    var oVideoId = document.getElementById("videoid"),
        oImposeBoundries = document.getElementById("imposeboundries"),
        oResumeAt = document.getElementById("resumevideoat"),
        iResumeAt = convertHHMMSS2Duration(oResumeAt.value),
        oRewindStart = document.getElementById("rewindStart"),
        oRewindStop = document.getElementById("rewindStop"),
        sRewindAlt = "Rewind " + iSecs + " Sec.",
        oStartAt = document.getElementById("startvideoat"),
        iStartAt = convertHHMMSS2Duration(oStartAt.value),
        oStopAt = document.getElementById("stopvideoat"),
        iStopAt = convertHHMMSS2Duration(oStopAt.value),
        oForwardStart = document.getElementById("forwardStart"),
        oForwardStop = document.getElementById("forwardStop"),
        sForwardAlt = "Forward " + iSecs + " Sec.",
        bRepeat = document.getElementById("repeat").checked,
        fCurrentTime,
        iDuration,
        oLog = document.getElementById("log");

    if (ytplayer && ytplayer.getInternalPlayer()) {
        iDuration = parseInt(ytplayer.getDuration());
        fCurrentTime = ytplayer.getCurrentTime();
        oRewindStart.title = sRewindAlt;
        oRewindStop.title = sRewindAlt;
        if (!oRewindStart.alt.length) {
            oRewindStart.alt = sRewindAlt;
        }
        if (!oRewindStop.alt.length) {
            oRewindStop.alt = sRewindAlt;
        }					
        oForwardStart.title = sForwardAlt;
        oForwardStop.title = sForwardAlt;
        if (!oForwardStart.alt.length) {
            oForwardStart.alt = sForwardAlt;
        }
        if (!oForwardStop.alt.length) {
            oForwardStop.alt = sForwardAlt;
        }

        //there was a start check here, maybe it depended on code partially running?    
        if (-1 != ytplayer.getInternalPlayer().getPlayerState()) {
            sCurrentVideoUrl = ytplayer.getInternalPlayer().getVideoUrl();
            sCurrentVideoId = sCurrentVideoUrl.substr(sCurrentVideoUrl.indexOf("v=") + 2, 11);
            //console.log("url " + sCurrentVideoUrl)
            //console.log("id " + sCurrentVideoId)
            //TODO print stuff
            if ((0 == iResumeAt) 
                || (sCurrentVideoId != oVideoId.value)
                ) {
                //console.log("overriding vid (res set to zero) " + oVideoId.value + " with " + sCurrentVideoId)
                oVideoId.value = sCurrentVideoId;
                oResumeAt.value = convertDuration2HHMMSS(0);
            }
            if ((0 == iStartAt) && (0 == iStopAt) 
                || (sCurrentVideoId != oVideoId.value)
                ) {
                //console.log("overriding vid (start/stop reset) " + oVideoId.value + " with " + sCurrentVideoId)
                oVideoId.value = sCurrentVideoId;
                resetAt("start");
                resetAt("stop");
            }
            //console.log("active elem " + document.activeElement.id);
            if (iStartAt > iStopAt) {
                if (document.activeElement.id != "stopvideoat") {
                    resetAt("stop");
                }
            }
            if (((iStartAt > 0) && (0 == iStopAt)) || ((iStartAt > 0) && (iStopAt > iDuration))) {
                if (document.activeElement.id != "stopvideoat") {
                    resetAt("stop");
                }
            }
            if (document.activeElement.id != "startvideoat") {
                updateBorder(oStartAt);
            }
            if (document.activeElement.id != "stopvideoat") {
                updateBorder(oStopAt);
            }
            if ((iDuration - fCurrentTime) < 1) {
                ytplayer.seekTo(iStartAt, 'seconds');
                if (!bRepeat) {
                    pausePlayer();
                }
            }
            if ((1 == parseInt(oImposeBoundries.value)) && (fCurrentTime >= iStopAt)) {
                if (bRepeat) {
                    seekVideo("start");
                } else {
                    pausePlayer();                        
                }
            }
        }
    }
}

function handleProgress(state) {
    //console.log('onProgress ' + state);
    //console.log(" " + playerElem)
    // We only want to update time slider if we are not currently seeking
    if (!ytplayer.state.seeking) {
        ytplayer.setState(state);
        checkBoundaries();
    }
}

function convertDuration2HHMMSS(seconds) {
    var iDuration = parseInt(seconds),
    iTotalMinutes = Math.floor(iDuration / 60),
    iHours = Math.floor(iTotalMinutes / 60),
    iMinutes = iTotalMinutes % 60,
    iSeconds = iDuration % 60;
    
    if (iHours > 0) {
        //console.log("converting " + seconds + ' to ' +  iHours + ":" + padZero(iMinutes) + ":" + padZero(iSeconds));
        return iHours + ":" + padZero(iMinutes) + ":" + padZero(iSeconds);
    } else {
        //console.log("converting " + seconds + ' to ' + iMinutes + ':' + padZero(iSeconds));
        return iMinutes + ':' + padZero(iSeconds);
    }
}

function padZero(number) {
    if (number < 10) {
        return "0" + number;
    } else {
        return number;
    }
}

function convertHHMMSS2Duration(time) {
    var iTotalSeconds = 0,
        aTime = time.split(":");

    switch (aTime.length) {
        case 3:
            iTotalSeconds += aTime[0] * 60 * 60;
            iTotalSeconds += aTime[1] * 60;
            iTotalSeconds += aTime[2] * 1;
            break;

        case 2:
            iTotalSeconds += aTime[0] * 60;
            iTotalSeconds += aTime[1] * 1;
            break;

        default:
            iTotalSeconds += aTime[0] * 1;
            break;
    }

    //console.log("converting " + time + ' to ' + iTotalSeconds);
    return iTotalSeconds;
}

function ucfirst( str ) {
    // http://kevin.vanzonneveld.net
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: Onno Marsman
    // +   improved by: Brett Zamir
    // *     example 1: ucfirst('kevin van zonneveld');
    // *     returns 1: 'Kevin van zonneveld'

    str += '';
    var f = str.charAt(0).toUpperCase();
    return f + str.substr(1);
}

var parseUrlQuery = function(urlQuery) {
    var aUrlQuery,
        aUrlParam,
        oUrlQuery = {};
    
    urlQuery = urlQuery.substring(1);
    
    aUrlQuery = urlQuery.split("&");
    
    for (var i = 0, j = aUrlQuery.length; i < j; i++) {
        aUrlParam = aUrlQuery[i].split("=");
        oUrlQuery[aUrlParam[0]] = aUrlParam[1];
    }
    
    return oUrlQuery;
},
oUrlQuery = parseUrlQuery(document.location.search),
iSecs = 1,
url,
container,
ytplayer,
playerElem,
oCustomPrompt,
oRKeyListener,
oFKeyListener;
//console.log('?' + (sUrlString.replace("yt_new.htm","")));
//console.log(document.location.search);

function outputUpdate(val) {
    sp = 1+(0.1*val);
    document.getElementById('speed').innerHTML= sp;
    if(ytplayer.getInternalPlayer()){
        ytplayer.getInternalPlayer().setPlaybackRate(sp);
    }
}

function loadBindings(){
    var fOK = function (e) {
        var oNewOpt,
            sExtractName = this.getData().extractName,
            oStartAt = document.getElementById("startvideoat"),
            oStopAt = document.getElementById("stopvideoat"),
            sExtractVal = oStartAt.value + " - " + oStopAt.value,
            oExtracts = document.getElementById("extracts"),
            oResumeAt = document.getElementById("resumevideoat"),
            oCustomPromptVisible = document.getElementById("customPromptVisible");
        //console.log('' + sExtractName);

        // (1) updates [extracts] menu with a new extract
        oNewOpt = new Option(sExtractName, sExtractVal);
        oExtracts.options[oExtracts.options.length] = oNewOpt;
        oExtracts.selectedIndex = oExtracts.options.length - 1;
        oExtracts.disabled = false;
        
        proxySync('syncExtractsAdd', ["extracts", sExtractName, sExtractVal]);

        document.getElementById("removeCurrentExtract").style.background = "transparent url(http://localhost:8000/iv/images/icons.png) no-repeat -112px 0";
        // (2) sets [resumevideoat] text input to [stopvideoat]
        // oResumeAt.value = oStopAt.value;
        // (3) sets [startvideoat] text input to EXPERIMENTAL Stop - 1 sec.
        oStartAt.value = convertDuration2HHMMSS(convertHHMMSS2Duration(oStopAt.value) - 1);
        proxySync('syncElement', ["startvideoat", oStartAt.value]);

        // (4) resets [stopvideoat] text input
        resetAt("stop");

        oCustomPromptVisible.value = 0;

        if (oCustomPromptVisible.value == 0) {
            this.hide();

            oRKeyListener.enable();
            oFKeyListener.enable();
        }
        playPlayer();
    },
    fCancel = function () {
        var oCustomPromptVisible = document.getElementById("customPromptVisible");

        oCustomPromptVisible.value = 0;

        if (oCustomPromptVisible.value == 0) {
            oCustomPrompt.cancel();

            oRKeyListener.enable();
            oFKeyListener.enable();
            playPlayer();
        }
    },
    oCustomPromptCfg = {
        visible: false,
        constraintoviewport: true,
        context: ["extracts", "bl", "tl"],
        width: "auto",
        dragOnly: true,
        modal: true,
        buttons: [
            {
                text: "OK",
                handler: fOK,
                isDefault: true
            },
            {
                text: "Cancel",
                handler: fCancel
            }
        ],
        postmethod: "none"
    },
    oESCKeyListener = new YAHOO.util.KeyListener(
        document,
        {
            keys: YAHOO.util.KeyListener.KEY.ESCAPE
        },
        {
            fn: fCancel,
            scope: oCustomPrompt,
            correctScope: true
        }
    ),
    // oEnterKeyListener = new YAHOO.util.KeyListener(
    //     document,
    //     {
    //         keys: YAHOO.util.KeyListener.KEY.ENTER
    //     },
    //     {
    //         fn: testy,
    //         scope: oCustomPrompt,
    //         correctScope: true
    //     }
    // ),
    fTurnRepeatOnOff = function () {
        var oRepeat = document.getElementById("repeat");

        if (oRepeat.checked) {
            oRepeat.checked = false;
        } else {
            oRepeat.checked = true;
        }
    },
    fTurnFullscreenOn = function () {
        if(ytplayer){
            //var video = document.getElementById("movie_player");
            var video = document.querySelector('bideo')
            if (video.msRequestFullscreen) {
                video.msRequestFullscreen();
            } 
        }
    };

    oRKeyListener = new YAHOO.util.KeyListener(
        document,
        {
            keys: 82
        },
        fTurnRepeatOnOff
    )
    oFKeyListener = new YAHOO.util.KeyListener(
        document,
        {
            keys: 70
        },
        fTurnFullscreenOn
    )

    oCustomPrompt = new YAHOO.widget.Dialog(
        "customPrompt",
        oCustomPromptCfg
    )

    YAHOO.util.Event.addListener(window, "unload", function() {
        //if (ytplayer && pausePlayer()) {
            ytplayer.getInternalPlayer().destroy();
        //}
    });
    
    oCustomPrompt.cfg.queueProperty("keylisteners", oESCKeyListener);
    //oCustomPrompt.cfg.queueProperty("keylisteners", oEnterKeyListener);
    oCustomPrompt.render();
    
    oRKeyListener.enable();
    oFKeyListener.enable();

    var aSelects = document.getElementsByTagName("select");

    for (i = 0, j = aSelects.length; i < j; i++) {
        if (!aSelects[i].options.length) {
            aSelects[i].disabled = true;
        }
    }

    var inputElem = document.getElementById('startvideoat');
    inputElem.addEventListener('keydown', arrowListener, false);

    inputElem = document.getElementById('stopvideoat');
    inputElem.addEventListener('keydown', arrowListener, false);

    inputElem = document.getElementById('resumevideoat');
    inputElem.addEventListener('keydown', arrowListener, false);
}

function proxyRPC(ctx, mcall, args){
    if(ctx && ctx[mcall]){
        ctx[mcall].apply(ctx, args);
    } 
}

//proxy function calls to the header and iframe windows
function proxySync(mcall, args){
    //IE detection
    if (window.document.documentMode){
        var that = window.opener;
        args.unshift(that);
        proxyRPC(that, mcall, args);
        return true;
    } else {
        setTimeout(syncIframe, 0, mcall, args);
        //TODO ws is not defined yet sync (?)
        if(ws && ws.readyState == 1){
            if(registered){
                //pop the queue and send the messages
                while(registerQueue.length > 0){
                    var element = registerQueue.shift();
                    console.log("sending queued " + element.mcall + " " + element.args);
                    jrpc.call(element.mcall, element.args);
                }
                jrpc.call(mcall, args);
            } else if(!betweenRedirect){
                //create and add to a queue
                console.log("queueing " + mcall);
                registerQueue.push({mcall:mcall, args:args});
            }
            return true;
        } else if (ws && ws.readyState == 0){
            //retry every 100ms until the websocket is open
            setTimeout(function(){ return proxySync(mcall, args)}, 100); 
        } else {
            alert("The window is out of sync.")
            return false;
        }
    }
}

//react-extension.js is the core logic, so we sync calls to listening windows
function syncIframe(mcall, args){
    if(args[0]){
        //check if args[0] is an element id
        let element = document.getElementById(args[0]);
        if(element){
            args[0] = "yt-" + element.id;
        }       
    }

    //try to send to youtube iframe [extension]
    let iframe = document.getElementById(PLAYER_IFRAME_ID);
    if(iframe){
        let iframeWindow = iframe.contentWindow;
        if(iframeWindow){
            let message = JSON.stringify({type:mcall, args:args});
            //behaviour mirrors websocket behaviour
            if(!iframeReady){
                console.log("queueing " + mcall);
                iframeQueue.push(message);
            } else {
                let queueEmptied = false;
                while(iframeQueue.length > 0){
                    console.log("sending queued" + mcall);
                    let element = iframeQueue.shift();
                    iframeWindow.postMessage(element, "*");
                    queueEmptied = true;
                }
                if(queueEmptied){
                    //TODO callbacks, order is not guaranteed
                    setTimeout(iframeWindow.postMessage(message, "*"), 100);
                } else {
                    iframeWindow.postMessage(message, "*");
                }
            }
        }
    } else {
        iframeQueue.push(JSON.stringify({type:mcall, args:args}));
    }
}

function loadSoundcloudPlayer(){
    container = document.getElementById('bideo');
    url = "https://soundcloud.com/jaytechmusic/jaytech-xmas-beats-2020";
    //url = "https://video.vidyard.com/watch/aA7PedfQuCAeg69PYkJynj";
    var test = {url:url, 
        playing:true,
        controls:true,
    };
    renderReactPlayer(container, test);
}

function loadVidyardPlayer(){
    container = document.getElementById('bideo');
    //url = "https://soundcloud.com/jaytechmusic/jaytech-xmas-beats-2020";
    url = "https://video.vidyard.com/watch/aA7PedfQuCAeg69PYkJynj";
    var test = {url:url, 
        playing:true,
        controls:true,
    };
    renderReactPlayer(container, test);
}

function loadRawPlayer(){
    container = document.getElementById('bideo');
    url = "https://samplelib.com/lib/preview/mp4/sample-10s.mp4";
    var test = {url:url, 
        playing:true,
        controls:true,
    };
    renderReactPlayer(container, test);
}

function openEdge(){
    window.open('microsoft-edge' + ':' + document.location)
}

//TODO reuse WS
function prevElement(){
    jrpc.notification('IElementWdwSvcBackButtonClick');
}
function beginLearning(){
    jrpc.notification('IElementWdwSvcBeginLearning');
}
function nextRep(){
    jrpc.notification('IElementWdwSvcNextRepetition');
}
function nextElement(){
    jrpc.notification('IElementWdwSvcForwardButtonClick');
}
function dismissElement(){
    jrpc.call('IElementWdwSvcGetCurrentElementId').then(function(id){
        if(id){
            jrpc.call('IElementWdwSvcDismissElement', [id]).then(function(result){
                if(result){
                    // TODO disable rep button
                }
            });
        }
    });
}

function registerRemote(a, b){
    jrpc.call("WebsocketServerAddRemoteTarget", [a, b]).then(function(result){
        if(result){
            console.log("AddRemoteTarget linked to targetId: " + result);
            //compare the targetId to the ws_id
            if(ws_id && Math.abs(result - ws_id) > 1){
                //TODO remove this alert after testing
                //alert("header jukebox ID mismatch. Close the window and try again.");
            } 
            registered = true;
            toggleButtonDisabled("wsenable", false);
        } else {
            console.log("AddRemoteTarget failed");
        }
    }).catch(function(error){
        console.error("AddRemoteTarget error: " + error);
    });
}

function toggleButtonDisabled(class_name, state){
    var aButtons = document.getElementsByClassName(class_name);
    for (i = 0; i < aButtons.length; i++) {
        aButtons[i].disabled = state;
    }
}

function setupWebsocket(){
    jrpc = new simple_jsonrpc();
    if(ws != undefined && ws.readyState == 1){
        ws.close();
    }
    ws = new WebSocket('ws://' + RPC_IP + ':' + String(RPC_PORT));
    ws.onopen = function() {
        //
    };
    jrpc.toStream = function(_msg){
        ws.send(_msg);
    };
    jrpc.on("registerName", function(id){
        registerName(id);
        return [WS_NAME, document.location.search];
    });

    jrpc.on("newClient", function(id, args, aaa){
        var name = args[0];
        var uri = args[1];
        console.log("new client: " + id + " name: " + name + " uri: " + uri);
        if(name == WS_NAME){
            registerRemote("jukebox", "header");
        } else if(name == "header"){
            // TODO restart websocket connection instead due to potential bug
            // https://github.com/microsoft/vs-streamjsonrpc/issues/878
            //setupWebsocket();

            //TODO sync new header and update player
            //registerRemote( "header", "jukebox");
            //TODO check still synced
            //TODO header ever register before jukebox?
            registered = false;
            //registerRemote("jukebox", "header");
            oUrlQuery = parseUrlQuery(uri);
            loadPlayer(true);
        }
    });
    jrpc.on("removeClientB", function(id, name){
        console.log("remove client: " + id + " name: " + name);
        if(name == "header"){
            // A) reuse window
            //TODO add non close deregister
            registered = false;
            betweenRedirect = true;
            toggleButtonDisabled("wsenable", true);

            // B) close window
            //window.close();
        }
        return true;
    });

    ws.onerror = function(error) {
        console.error("Error: " + error.message);
    };
    ws.onmessage = function(event) {
        jrpc.messageHandler(event.data);
    };
    ws.onclose = function(event) {
        if (event.wasClean) {
            console.info('Connection close was clean');
        } else {
            console.error('Connection suddenly close');
        }
        console.info('close code : ' + event.code + ' reason: ' + event.reason);
    };
}

function registerName(id){
    console.log("register id: " + id + " name: " + WS_NAME)
    ws_id = id;
}   

function loadPlayer(firstrun){
    console.log("player loaded")
    //assume URL is authoritative
    document.getElementById("videoid").value = oUrlQuery.videoid;
    document.getElementById("resumevideoat").value = oUrlQuery.resume;   
    document.getElementById("startvideoat").value = oUrlQuery.start;
    document.getElementById("stopvideoat").value = oUrlQuery.stop;
    proxySync('syncElement', ["resumevideoat", oUrlQuery.resume]);
    proxySync('syncElement', ["startvideoat", oUrlQuery.start]);
    proxySync('syncElement', ["stopvideoat", oUrlQuery.stop]);
    
    //IE detection
    if(!window.document.documentMode && firstrun){
        setTimeout(setupWebsocket());
    }

    container = document.getElementById('bideo');
    //console.log(oUrlQuery.videoid);
    url = "http://www.youtube.com/v/" + oUrlQuery.videoid;
    start_s = convertHHMMSS2Duration(oUrlQuery.start)

    var config = {
        youtube: {
            playerVars: { start: start_s}
        },
    };
    var react_config = {url:url, 
        playing:true,
        config:config,
        controls:true,
        onReady:handlePlayerReady,
        onProgress:handleProgress,
        onPause:handlePause,
        onPlay:handlePlay,
    };

    renderReactPlayer(container, react_config);
}

window.onbeforeunload = function() {
    if(ws && ws.readyState == 1){
        ws.close();
    }
};

function setIframeState(status){
    console.log("iframe ready received: " + status);
    iframeReady = status;
}

window.addEventListener("message", function(event) {
    if(ACCEPTABLE_ORIGINS.indexOf(event.origin) == -1){ 
        return;
    }
    var data = JSON.parse(event.data);
    if(window[data.type]){
        data.args = data.args || [];
        // window[data.type](data.args);
        //apply args to function
        window[data.type].apply(null, data.args);
    }
});

document.addEventListener("DOMContentLoaded", function(event) {
    attachHandlers();
});