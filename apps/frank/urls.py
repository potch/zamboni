from django.conf.urls.defaults import patterns, url, include
from . import views

urlpatterns = patterns('',
    url('^$', views.home, name='frank.home'),
    url('^addons/popular$', views.popular, name='frank.popular'),
)