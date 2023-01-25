// Expose functions for syncing between SuperMemo YouTube windows
// version: 1.0.1
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

