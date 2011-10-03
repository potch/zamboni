from django.conf.urls.defaults import patterns, url, include
from . import views

urlpatterns = patterns('',
    url('^$', views.review_list, name='frank.home'),
)