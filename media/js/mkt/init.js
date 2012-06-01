var z = {
    page: $('#page'),
    prefix: (function() {
        var s = window.getComputedStyle(document.body, '');
        return (Array.prototype.slice.call(s).join('').match(/moz|webkit|ms|khtml/)||(s.OLink===''&&['o']))[0];
    })(),
    prefixed: function(property) {
        if (!z.prefix) return property;
        return '-' + z.prefix + '-' + property;
    },
    canInstallApps: true,
    allowAnonInstalls: !!$('body').data('allow-anon-installs')
};

z.prefixUpper= z.prefix[0].toUpperCase() + z.prefix.substr(1);


(function() {
    _.extend(z, {'nav': BrowserUtils()});
    if (!z.nav.browser.firefox ||
        z.nav.browser.mobile || z.nav.browser.android || z.nav.browser.maemo ||
        VersionCompare.compareVersions(z.nav.browserVersion, '15.0a1') < 0) {
        z.canInstallApps = false;
    }
})();

// Initialize webtrends tracking.
z.page.on('fragmentloaded', webtrendsAsyncInit);

(function() {
    function trigger() {
        $(window).trigger('saferesize');
    }
    window.addEventListener('resize', _.debounce(trigger, 200), false);
})();

$(document).ready(function() {
    // Initialize email links.
    z.page.on('fragmentloaded', function() {
        $('span.emaillink').each(function() {
            var $this = $(this);
            $this.find('.i').remove();
            var em = $this.text().split('').reverse().join('');
            $this.prev('a').attr('href', 'mailto:' + em);
        });
    });
    if (z.readonly) {
        $('form[method=post]')
            .before(gettext('This feature is temporarily disabled while we ' +
                            'perform website maintenance. Please check back ' +
                            'a little later.'))
            .find('button, input, select, textarea').attr('disabled', true)
            .addClass('disabled');
    }
    var data_user = $('body').data('user');
    _.extend(z, {
        anonymous: data_user.anonymous,
        pre_auth: data_user.pre_auth
    });

    stick.basic();
});


z.page.on('fragmentloaded', function() {
    if (z.capabilities.webApps) {
        // Get list of installed apps and mark as such.
        r = window.navigator.mozApps.getInstalled();
        r.onsuccess = function() {
            z.apps = r.result;
            _.each(r.result, function(val) {
                $(window).trigger('app_install_success',
                                  [{'manifestUrl': val.manifestURL}, false])
                         .trigger('app_install_mark',
                                  {'manifestUrl': val.manifestURL});
            });
        };
    } else {
        z.apps = {};
    }

    if (!z.canInstallApps) {
        $(window).trigger('app_install_disabled');
    }

    // Set body classes and store baseline classes in $('body').data for
    // fragment-loading jazz.
    var $body = $('body'),
        baseline = $body.attr('class').split(' ')[0],
        device = z.capabilities.touch ? 'touch' : 'desktop';
    baseline += ' ' + device;
    $body.data('class', baseline).addClass(device);

    // Navigation toggle.
    var $header = $('#site-header'),
        $nav = $header.find('nav ul');
    $header.on('click', '.menu-button', function() {
        $nav.addClass('active');
        $('.nav-overlay').addClass('show');
    });

    // $header.on('focus.search', '#search-q', function() {
    //     $('#search-go').show();
    // }).blur('blur.search', '#search-q', function() {
    //     $('#search-go').hide();
    // });

    $(window).bind('overlay_dismissed', function() {
       $nav.removeClass('active');
    }).bind('app_install_mark', function(e, product) {
        var $li = $(format('.listing li[data-manifest="{0}"]',
                           product.manifestUrl)),
            $actions = $li.find('.actions'),
            $purchased = $actions.find('.checkmark.purchased'),
            installed = format('<span class="checkmark installed">{0}</span>',
                               gettext('Installed'));
        if ($purchased.length) {
            $purchased.replaceWith(installed);
        } else {
            $purchased.prepend(installed);
        }
    });
});
