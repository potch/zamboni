from django import http
from django.conf import settings

import jingo
from product_details import product_details

from access.models import Group
from amo.urlresolvers import reverse

from .models import L10nSettings


def summary(request):
    """global L10n dashboard"""

    data = {
        'languages': product_details.languages,
        'amo_languages': sorted(settings.AMO_LANGUAGES +
                                settings.HIDDEN_LANGUAGES),
        'hidden_languages': settings.HIDDEN_LANGUAGES,
    }

    return jingo.render(request, 'localizers/summary.html', data)


def locale_switcher(f):
    """Decorator redirecting clicks on the locale switcher dropdown."""
    def decorated(request, *args, **kwargs):
        new_userlang = request.GET.get('userlang')
        if (new_userlang and new_userlang in settings.AMO_LANGUAGES or
            new_userlang in settings.HIDDEN_LANGUAGES):
            kwargs['locale_code'] = new_userlang
            return http.HttpResponsePermanentRedirect(reverse(
                decorated, args=args, kwargs=kwargs))
        else:
            return f(request, *args, **kwargs)
    return decorated


def valid_locale(f):
    """Decorator validating locale code for per-language pages."""
    def decorated(request, locale_code, *args, **kwargs):
        if locale_code not in (settings.AMO_LANGUAGES +
                               settings.HIDDEN_LANGUAGES):
            raise http.Http404
        return f(request, locale_code, *args, **kwargs)
    return decorated


@locale_switcher
@valid_locale
def locale_dashboard(request, locale_code):
    """per-locale dashboard"""
    data = {
        'locale_code': locale_code,
        'userlang': product_details.languages[locale_code],
    }

    # group members
    try:
        group = Group.objects.get(
            rules__startswith=('Localizers:%s' % locale_code))
        members = group.users.all()
    except Group.DoesNotExist:
        members = None
    data['members'] = members

    # team homepage
    try:
        l10n_set = L10nSettings.objects.get(locale=locale_code)
        team_homepage = l10n_set.team_homepage
    except L10nSettings.DoesNotExist:
        team_homepage = None
    data['team_homepage'] = team_homepage

    return jingo.render(request, 'localizers/dashboard.html', data)


@locale_switcher
@valid_locale
def categories(request, locale_code):
    return http.HttpResponse(
        'this is the categories dashboard for %s' % locale_code)


@locale_switcher
@valid_locale
def collection_features(request, locale_code):
    return http.HttpResponse(
        'this is the collection feat. dashboard for %s' % locale_code)
