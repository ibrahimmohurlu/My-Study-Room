from django.urls import path
from . import views

urlpatterns = [
    path('', views.lobby),
    path('room/', views.room),
    path('get_token/', views.getToken),
    path('create_member/', views.createMember),
    path('get_member/', views.getMember),
    path('delete_member/', views.deleteMember),
    path('get_members/',views.getMembers),
    path('update_status/',views.updateMemberStatus),
    path('can_session_start/',views.canSessionStart)
]
