(function() {

    function installButton() {
        var $self = $(this);
        var obj = {
            addon   : $this.attr('data-addon'),
            min     : $this.attr('data-min'),
            max     : $this.attr('data-max'),
            name    : $this.attr('data-name'),
            icon    : $this.attr('data-icon'),
            after   : $this.attr('data-after'),
            search  : $this.hasattr('data-search'),
            premium : $this.hasClass('premium')
        };
    }

    jQuery.fn.installButton = function() {
        return this.each(installButton);
    };

})();