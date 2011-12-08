(function() {

//configure some things.
try {
    z.hasACR = z.Storage().get('ShowIncompatibleAddons');
} catch (TypeError) {
}

$(window).bind('install', processInstall);

function processInstall(opt) {
    
}

})();