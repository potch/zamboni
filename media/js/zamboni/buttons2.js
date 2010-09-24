// (function() {
    
    function Button(el) {
        
        // the actionQueue holds all the various events that have to happen
        // when the user clicks the button. This includes the terminal action,
        // such as "install", "purhcase", or "add to mobile".
        // actions are a tuple of the form [n, cb], where cb is a method that
        // is called when the action is executed, and n is the priority of the
        // action. The queue is sorted before execution. the callback is
        // executed in the function's scope. To resume, call this.nextAction()
        // after a user or other blocking atction, or return true to
        // immediately execute the next action.
        this.actionQueue = [];


        var self = this,
            attr, classes,
            //setup references to DOM UI.
            dom = {
                'self'    : $(el),
                //Can be multiple buttons in the case of platformers
                'buttons' : $('.button', el),
                'labels'   : $('.button span', el)
            };


        // the initializer is called once when the button is created.
        this.init = function() {
            initFromDom();
            
            //versionPlatformCheck();

            // sort the actionQueue by priority
            this.actionQueue.sort(function (a, b) {return b[0]-a[0]});
        };


        // performs the next action in the queue.
        function nextAction() {
            if (this.actionQueue.length < 1) return;
            // execute the next action.
            var result = this.actionQueue[0][1].call(this);
            // execute the next action if the current action returns true.
            if (result === true) {
                this.resumeInstall();
            };
        }
        this.resumeInstall = function() {
            // dequeue current action and move on.
            this.actionQueue.shift();
            nextAction();
        };


        //collects all the classes and parameters from the DOM elements.
        function initFromDom() {
            var b = dom['self'];

            self.attr = {
                'addon'       : b.attr('data-addon'),
                'min'         : b.attr('data-min'),
                'max'         : b.attr('data-max'),
                'name'        : b.attr('data-name'),
                'icon'        : b.attr('data-icon'),
                'after'       : b.attr('data-after'),
                'search'      : b.hasattr('data-search'),
                'accept_eula' : b.hasClass('accept')
            };
            
            self.classes = {
                'selfhosted'  : b.hasClass('selfhosted'),
                'beta'        : b.hasClass('beta'),
                'unreviewed'  : b.hasClass('unreviewed'), // && !beta,
                'persona'     : b.hasClass('persona'),
                'contrib'     : b.hasClass('contrib'),
                'search'      : b.hasattr('data-search'),
                'eula'        : b.hasClass('eula')
            };
            
            self.platforms = dom.buttons.filter(".platform").map(function () {
                return this.attr("data-platform");
            })
        }

        // Add version and platform warnings and (optionally) popups.  This is one
        // big function since we merge the messaging when bad platform and version
        // occur simultaneously.  Returns true if a popup was added.
        versionPlatformCheck = function(options) {
            var opts = $.extend({addPopup: true, addWarning: true, extra: ''},
                                options);
                warn = opts.addWarning ? addWarning : $.noop;

            var addExtra = function(f) {
                /* Decorator to add extra content to a message. */
                return function() {
                    var extra = $.isFunction(opts.extra) ? opts.extra()
                                    : opts.extra;
                    return $(f.apply(this, arguments)).append(extra);
                };
            };

            // Popup message helpers.
            var pmsg = addExtra(function() {
                var links = $.map(platforms, function(o) {
                    return format(z.button.messages['platform_link'], o);
                });
                return format(z.button.messages['bad_platform'],
                              {platforms: links.join('')});
            });
            var vmsg = addExtra(function() {
                params['new_version'] = max;
                params['old_version'] = z.browserVersion;
                return message(newerBrowser ? 'not_updated' : 'newer_version')();
            });
            var merge = addExtra(function() {
                // Prepend the platform message to the version message.  We only
                // want to move the installer when we're looking at an older
                // version of the add-on.
                var p = $(pmsg()), v = $(vmsg());
                v.prepend(p.find('.msg').clone());
                if (this.switchInstaller) {
                    v.find('.installer').parent().html(p.find('ul').clone());
                }
                return v;
            });

            // Do badPlatform prep out here since we need it in all branches.
            if (badPlatform) {
                warn(gettext('Not available for your platform'));
                $button.addClass('concealed');
                $button.first().css('display', 'inherit');
            }

            if (appSupported && (olderBrowser || newerBrowser)) {
                // L10n: {0} is an app name, {1} is the app version.
                warn(format(gettext('Not available for {0} {1}'),
                                  [z.appName, z.browserVersion]));
                $button.addClass('concealed');
                if (!opts.addPopup) return;

                if (badPlatform && olderBrowser) {
                    $button.addPopup(merge);
                } else if (badPlatform && newerBrowser) {
                    $button.addPopup(_.bind(merge, {switchInstaller: true}));
                } else {
                    // Bad version.
                    $button.addPopup(vmsg);
                }
                return true;
            } else if (badPlatform && opts.addPopup) {
                // Only bad platform is possible.
                $button.addPopup(pmsg);
                return true;
            } else if (!unreviewed && (appSupported || search)) {
                // Good version, good platform.
                $button.addClass('installer');
            }
        };
        
        //and of course, initialize the button.
        this.init();
    }
    
    
    z.button = function() {
        new Button(this);
    }
    
    $(function() {
        console.log(new Button($('.install')[0]));
    });
    // jQuery.fn.installButton = function() {
    //     return this.each(z.button);
    // };
    
    
    
    
// })();