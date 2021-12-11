from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^round1$', views.round1, name='round1'),
    url(r'^round2$', views.round2, name='round2'),
    url(r'^round3$', views.round3, name='round3'),

	url(r'^$', views.screen, name='screen'),

	url(r'^end$', views.end, name='end'),
	url(r'^intro1$', views.intro1, name='intro1'),
	url(r'^intro3$', views.intro3, name='intro3'),
    url(r'^intro2$', views.intro2, name='intro2'),
    url(r'^submit1$', views.submitAnnotation_Round1, name='submitAnnotation_Round1'),
    url(r'^nextvideo$', views.render_next_video, name='render_next_video'),
    url(r'^nextvideo3$', views.render_next_video3, name='render_next_video3'),

]

url_patterns = [
    url(r'^dumbcharades/', include(url_patterns))
]