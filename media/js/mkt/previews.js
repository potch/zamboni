(function() {

    var sliderTemplate = getTemplate($('#preview-tray'));
    var previewTemplate = getTemplate($('#single-preview'));

    var thumbUrlTemplate = $('body').data('thumbs-url');
    var thumb = template(thumbUrlTemplate);

    var fullUrlTemplate = $('body').data('full-url');
    var full = template(fullUrlTemplate);

    // magic numbers!
    var THUMB_WIDTH = 180;
    var THUMB_PADDED = 195;

    if (!sliderTemplate || !previewTemplate) {
        return;
    }

    z.page.on('dragstart', function(e) {
        e.preventDefault();
    });

    function populateTray() {
        // preview trays expect to immediately follow a .mkt-tile.
        var $tray = $(this);
        var $tile = $tray.prev();

        // If populateTray gets called twice don't re-init.
        if (!$tile.hasClass('mkt-tile') || $tray.find('.slider').length) {
            return;
        }

        var product = $tile.data('product');
        var previewsHTML = '';
         if (!product.previews) return;
        _.each(product.previews, function(p) {
            p.typeclass = (p.type === 'video/webm') ? 'video' : 'img';
            p.thumbUrl = thumb([~~(p.id/1000), p.id, p.modified]);
            p.fullUrl = full([~~(p.id/1000), p.id, p.modified]);
            previewsHTML += previewTemplate(p);
        });

        var dotHTML = '';
        if (product.previews.length > 1) {
            dotHTML = Array(product.previews.length + 1).join('<b class="dot"></b>');
        }
        $tray.html(sliderTemplate({previews: previewsHTML, dots: dotHTML}));

        var numPreviews = $tray.find('li').length;
        var $content = $tray.find('.content');

        var width = numPreviews * THUMB_PADDED - 15;

        $tray.find('.content').css({
            'width': width + 'px',
            'margin': '0 ' + ($tray.width() - THUMB_WIDTH) / 2 + 'px'
        });

        var slider = Flipsnap($content[0], {distance: 195});
        var $pointer = $tray.find('.dots .dot');

        slider.element.addEventListener('fsmoveend', setActiveDot, false);

        // Show as many thumbs as possible to start. Using MATH!
        slider.moveToPoint(~~($tray.width() / THUMB_PADDED / 2));

        function setActiveDot() {
            $pointer.filter('.current').removeClass('current');
            $pointer.eq(slider.currentPoint).addClass('current');
        }
        $tray.on('click', '.dot', function() {
            slider.moveToPoint($(this).index());
        });

        function attachHandles() {
            var $prevHandle = $('<a href="#" class="prev"></a>'),
                $nextHandle = $('<a href="#" class="next"></a>');

            function setHandleState() {
                $prevHandle.hide();
                $nextHandle.hide();

                if (slider.hasNext()) {
                    $nextHandle.show();
                }
                if (slider.hasPrev()) {
                    $prevHandle.show();
                }
            }

            $prevHandle.click(_pd(function() {
                slider.toPrev();
            }));
            $nextHandle.click(_pd(function() {
                slider.toNext();
            }));

            slider.element.addEventListener('fsmoveend', setHandleState);

            setHandleState();
            $tray.find('.slider').append($prevHandle, $nextHandle);
        }

        // Tray can fit 3 desktop thumbs before paging is required.
        if (numPreviews > 3 && z.capabilities.desktop) {
            attachHandles();
        }
    }

    z.page.on('fragmentloaded populatetray', function() {
        var trays = $('.listing.expanded .mkt-tile + .tray');
        trays.each(populateTray);
    });

})();
