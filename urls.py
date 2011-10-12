import os.path
from django.conf import settings
from django.conf.urls.defaults import patterns, url, include
from django.contrib import admin
from django.shortcuts import redirect
from django.views.i18n import javascript_catalog
from django.views.decorators.cache import cache_page

from amo.urlresolvers import reverse

import blocklist.views
import versions.urls

admin.autodiscover()

handler404 = 'amo.views.handler404'
handler500 = 'amo.views.handler500'

urlpatterns = patterns('',
    # Discovery pane is first for undetectable efficiency wins.
    ('^discovery/', include('discovery.urls')),

    # There are many more params but we only care about these three. The end is
    # not anchored on purpose!
    url('^blocklist/(?P<apiver>\d+)/(?P<app>[^/]+)/(?P<appver>[^/]+)/',
        blocklist.views.blocklist, name='blocklist'),
    ('^blocked/', include('blocklist.urls')),

    # Add-ons.
    ('', include('addons.urls')),

    # Web apps.
    ('^apps/', include('webapps.urls')),

    # Browse pages.
    ('', include('browse.urls')),

    # Tags.
    ('', include('tags.urls')),

    # Collections.
    ('', include('bandwagon.urls')),

    # Files
    ('^files/', include('files.urls')),

    # Downloads.
    ('^downloads/', include(versions.urls.download_patterns)),

    # Localizer Pages
    ('', include('localizers.urls')),

    # Users
    ('', include('users.urls')),

    # Developer Hub.
    ('^developers/', include('devhub.urls')),

    # Developer Hub.
    ('editors/', include('editors.urls')),

    # AMO admin (not django admin).
    ('^admin/', include('zadmin.urls')),

    # Performance wall of shame.
    ('^performance/', include('perf.urls')),

    # Localizable pages.
    ('', include('pages.urls')),

    # App versions.
    ('pages/appversions/', include('applications.urls')),

    # Services
    ('', include('amo.urls')),

    # Search
    ('^search/', include('search.urls')),

    # Global stats dashboard.
    url('^statistics/', lambda r: redirect('/'), name='statistics.dashboard'),

    # Javascript translations.
    url('^jsi18n.js$', cache_page(60 * 60 * 24 * 365)(javascript_catalog),
        {'domain': 'javascript', 'packages': ['zamboni']}, name='jsi18n'),

    # SAMO/API
    ('^api/', include('api.urls')),

    ('^compatibility/', include('compat.urls')),

    # Review spam.
    url('^reviews/spam/$', 'reviews.views.spam', name='reviews.spam'),

    # marketplace
    ('^market/', include('market.urls')),

    # Redirect patterns.
    ('^bookmarks/?$',
      lambda r: redirect('browse.extensions', 'bookmarks', permanent=True)),

    ('^reviews/display/(\d+)',
      lambda r, id: redirect('reviews.list', id, permanent=True)),

    ('^reviews/add/(\d+)',
      lambda r, id: redirect('reviews.add', id, permanent=True)),

    ('^users/info/(\d+)',
     lambda r, id: redirect('users.profile', id, permanent=True)),

    ('^pages/about$',
     lambda r: redirect('pages.about', permanent=True)),

    ('^pages/faq$',
     lambda r: redirect('pages.faq', permanent=True)),

    # Redirect persona/xxx
    url('^persona/(?P<persona_id>\d+)', 'addons.views.persona_redirect',
        name='persona'),

    # Redirect top-tags to tags/top
    ('^top-tags/?',
     lambda r: redirect('tags.top_cloud', permanent=True)),

    ('^personas/film and tv/?$',
     lambda r: redirect('browse.personas', 'film-and-tv', permanent=True)),

    ('^addons/versions/(\d+)/?$',
     lambda r, id: redirect('addons.versions', id, permanent=True)),

    ('^addons/versions/(\d+)/format:rss$',
     lambda r, id: redirect('addons.versions.rss', id, permanent=True)),

    # Legacy redirect. Requires a view to get extra data not provided in URL.
    ('^versions/updateInfo/(?P<version_id>\d+)$',
     'versions.views.update_info_redirect'),

    ('^addons/reviews/(\d+)/format:rss$',
     lambda r, id: redirect('reviews.list.rss', id, permanent=True)),

    ('^search-engines.*$',
     lambda r: redirect('browse.search-tools', permanent=True)),

    ('^addons/contribute/(\d+)/?$',
     lambda r, id: redirect('addons.contribute', id, permanent=True)),

    ('^recommended$',
     lambda r: redirect(reverse('browse.extensions') + '?sort=featured',
                        permanent=True)),

    ('^recommended/format:rss$',
     lambda r: redirect('browse.featured.rss', permanent=True)),

)

urlpatterns += patterns('piston.authentication.oauth.views',
    url(r'^oauth/request_token/$', 'get_request_token',
        name='oauth.request_token'),
    url(r'^oauth/authorize/$', 'authorize_request_token',
        name='oauth.authorize'),
    url(r'^oauth/access_token/$', 'get_access_token',
        name='oauth.access_token'),
)

if 'django_qunit' in settings.INSTALLED_APPS:

    def _zamboni_qunit(request, path, template):
        from time import time
        import django_qunit.views
        import jingo
        import mock
        ctx = django_qunit.views.get_suite_context(request, path)
        ctx.update(timestamp=time(), Mock=mock.Mock)
        response = jingo.render(request, template, ctx)
        # This allows another site to embed the QUnit suite
        # in an iframe (for CI).
        response['x-frame-options'] = ''
        return response

    def zamboni_qunit(request, path):
        return _zamboni_qunit(request, path, 'qunit/qunit.html')

    def zamboni_pre_impala_qunit(request, path):
        return _zamboni_qunit(request, os.path.join(path, 'pre-impala/'),
                              'qunit/pre_impala.html')

    urlpatterns += patterns('',
        url(r'^qunit/pre-impala/(?P<path>.*)', zamboni_pre_impala_qunit),
        url(r'^qunit/(?P<path>.*)', zamboni_qunit),
        url(r'^_qunit/', include('django_qunit.urls')),
    )

if settings.TEMPLATE_DEBUG:
    # Remove leading and trailing slashes so the regex matches.
    media_url = settings.MEDIA_URL.lstrip('/').rstrip('/')
    urlpatterns += patterns('',
        (r'^%s/(?P<path>.*)$' % media_url, 'django.views.static.serve',
         {'document_root': settings.MEDIA_ROOT}),
    )
