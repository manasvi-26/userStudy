from django.conf.urls import url
from . import views
from django.conf.urls import include

non_prefix_urls= [
	url(r'^$', views.dashboard, name='dashboard'),
	url(r'^addNewUser$', views.addNewUser, name='addNewUser'),

]

url_patterns = [
    url(r'^dumbcharades/', include(non_prefix_urls))
]