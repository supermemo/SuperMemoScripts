// Expose functions for syncing between SuperMemo YouTube windows
// version: 1.1.0
X_URL_ICON = "transparent url(http://localhost:8000/iv/images/icons.png) no-repeat -112px 0"
FADED_X_URL_ICON = "transparent url(http://localhost:8000/iv/images/icons.png) no-repeat -96px 0"

function setExtractIcon(ctx, id, icon){
    if(id.indexOf("yt-") > -1){
        var removeBtn = ctx.document.getElementById("yt-removeCurrentExtract")
    } else {
        var removeBtn = ctx.document.getElementById("removeCurrentExtract")
    }
    if(removeBtn){
        removeBtn.style.background = icon;
    }
}
function syncElement(ctx, id, value) {
    ctx.document.getElementById(id).value = value
}

function syncBorder(ctx, id, value) {
    ctx.document.getElementById(id).style.border = value;
}

function syncInnerHTML(ctx, id, value) {
    ctx.document.getElementById(id).innerHTML = value;
}

function syncExtractsAdd(ctx, id, sExtractName, sExtractVal) {
    oExtracts = ctx.document.getElementById(id);
    oNewOpt = new Option(sExtractName, sExtractVal);
    oExtracts.options[oExtracts.options.length] = oNewOpt;
    oExtracts.selectedIndex = oExtracts.options.length - 1;
    oExtracts.disabled = false;
    removeBtn = null;
    setExtractIcon(ctx, id, X_URL_ICON);
}

// emulate behavior between windows as much as possible
function syncExtractsRemove(ctx, id) {
    oExtracts = ctx.document.getElementById(id);
    oCurrentExtract = oExtracts.options[oExtracts.selectedIndex];

    oExtracts.options[oExtracts.selectedIndex] = null;
    if (oExtracts.options.length) {
        oExtracts.selectedIndex = oExtracts.options.length - 1;
    } else {
        oExtracts.disabled = true;
        setExtractIcon(ctx, id, FADED_X_URL_ICON);
    }
}

function syncExtractsSelect(ctx, id, selectedIndex) {
    oSelect = ctx.document.getElementById(id);
    oSelect.selectedIndex = selectedIndex;
}

function proxyRPC(mcall, args){
    //console.log("routing remote call: " + mcall + " args: " + args);
    if(this[mcall]){
        if(mcall.lastIndexOf("sync", 0) === 0){
            if(String(args).indexOf(",") > -1){
                args = String(args).split(",");
            }
            args.unshift(window);
        }
        this[mcall].apply(this, args);
    } else {
        console.warn("proxy mcall is undefined");
    }
}

function registerProxyHandler(acceptedOrigins){
    window.addEventListener("message", function(event) {
        //only aacknowledge messages from the accepted origins
        if (acceptedOrigins.indexOf(event.origin) === -1)
            return;
        if(event.data.indexOf('"event":"listening"') > -1){
            return;
        }
        console.log("message received from: " + event.origin);
        console.log("message data: " + event.data);

        var data = JSON.parse(event.data);
        if (data.type) {
            proxyRPC(data.type, data.args);
        }
    });
}

function setIframeState(s){
    console.log("sending iframe state: " + s);
    callOn(window.parent, "setIframeState", [s]);
}

// -----override methods to sync with parent window -----
//TODO one method to rule them all
function feedCurrentExtract(e){
    e = e || undefined;
    var extract = document.getElementById("yt-extracts") || document.getElementById("extracts");
    callOn(window.parent, "feedExtractChange", [extract.selectedIndex]);
}

function removeCurrentExtract(){
    callOn(window.parent, "removeCurrentExtract", []);
}

function addExtract(offset){
    callOn(window.parent, "addExtract", [offset]);
}

function testExtract(){
    callOn(window.parent, "testExtract", []);
}

function resetExtract(){
    callOn(window.parent, "resetExtract", []);
}

function setAt(type, offset, sync){
    callOn(window.parent, "setAt", [type, offset, sync]);
}

function resetAt(type){ 
    callOn(window.parent, "resetAt", [type]);
}

function goTo(type){
    callOn(window.parent, "goTo", [type]);
}

function resumeVideo(){
    callOn(window.parent, "playPlayer", []);
}

function move(type, where) {
    callOn(window.parent, "move", [type, where]);
}

//TODO do oynamically from function definitions
//TODO complete all element methds

function callOn(wdw, mcall, args){
    wdw.postMessage(JSON.stringify({type: mcall, args: args}), "*");
}   

elements = [
    {id: "mark", onclick: function() {setAt('resume', 0, true);}},
    {id: "resume", onclick: function() {goTo('resume');}},
    {id: "resumevideoat", dblclick: function() {resetAt('resume');}, 
    onfocus: function() {this.select();}, 
    onchange: function() {this.value = convertDuration2HHMMSS(convertHHMMSS2Duration(this.value));}, 
    onclick: function() {setAt('resume', 0, true);}, onscroll: function() {console.log('scroll');}},
    {id: "restoreResumeAt", onclick: function() {resetAt('resume');}},
    {id: "start", onclick: function() {setAt('start', 0, true);}},
    {id: "goToStart", onclick: function() {goTo('start');}},
    {id: "startvideoat", dblclick: function() {resetAt('start');this.select();}, 
    onfocus: function() {this.select();}, 
    onchange: function() {this.value = convertDuration2HHMMSS(convertHHMMSS2Duration(this.value));var that = this;imposeBoundaries(0, that);}, 
    onclick: function() {setAt('start', 0, true);this.select();}},
    {id: "restoreStartAt", onclick: function() {resetAt('start');}},
    {id: "restoreStopAt", onclick: function() {resetAt('stop');}},
    {id: "stopvideoat", dblclick: function() {resetAt('stop');}, 
    onfocus: function() {this.select();}, 
    onchange: function() {this.value = convertDuration2HHMMSS(convertHHMMSS2Duration(this.value));var that = this;imposeBoundaries(0, that);}, 
    onclick: function() {setAt('stop', 0, true);this.select();}},
    {id: "goToStop", onclick: function() {goTo('stop');}},
    {id: "stop", onclick: function() {setAt('stop', 0, true);}},
    {id: "test", onclick: function() {testExtract();}},
    {id: "reset", onclick: function() {resetExtract();}},
    {id: "extract", onclick: function() {addExtract(0);}},
    {id: "extracts", onchange: function(){ feedCurrentExtract(); }, onclick: function(){ feedCurrentExtract(); }},
    {id: "removeCurrentExtract", onclick: function(){ removeCurrentExtract(); }},
    {id: "back", onclick: function(){ prevElement(); }},
    {id: "learn", onclick: function(){ beginLearning(); }},
    {id: "rep", onclick: function(){ nextRep(); }},
    {id: "fwd", onclick: function(){ nextElement(); }},
    {id: "dismiss", onclick: function(){ dismissElement(); }},
    {id: "extractm5", onclick: function(){ addExtract(-5); }},
    {id: "extract5", onclick: function(){ addExtract(5); }},
    {id: "copyBtn", onclick: function(){ copyVideoDetails(); }},
    {id: "screenshotBtn", onclick: function(){ screenshotVideo(); }},
    {id: "rewindResume", onclick: function(){ move('resume', 'rewind'); }},
    {id: "rewindStart", onclick: function(){ move('start', 'rewind'); }},
    {id: "rewindStop", onclick: function(){ move('stop', 'rewind'); }},
    {id: "forwardResume", onclick: function(){ move('resume', 'forward'); }},
    {id: "forwardStart", onclick: function(){ move('start', 'forward'); }},
    {id: "forwardStop", onclick: function(){ move('stop', 'forward'); }}
];

function attachHandlers(prefix){
    console.log("attaching handlers");
    prefix = prefix || '';
    for (var i = 0; i < elements.length; i++) {
        var element = elements[i];
        var el = document.getElementById(prefix + element.id);
        if (el) {
            for (var key in element) {
                if (key !== 'id') {
                    el[key] = element[key];
                }
            }
        }
    }
}

function addToElement(id, handler){
    var el = document.getElementById(id);
    if (el) {
        let descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value');
        Object.defineProperty(el, 'value', {
            get: function() {
                return descriptor.get.apply(this);
            },      
            set: function(value) {
                var res = descriptor.set.apply(this, arguments);
                handler.call(this);
                return res;
            }
        });
    }
}