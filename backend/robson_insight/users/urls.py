from django.urls import path
from .views import *


app_name = 'users'
urlpatterns = [
    path('', UserProfileList.as_view()),
    path('<int:pk>/', UserProfileDetail.as_view()),
    path('groups/', GroupListCreate.as_view()),
    path('add-user-to-group/', AddUserToGroupView.as_view(), name='add-user-to-group'),
    path('groups/<int:pk>/', GroupDetail.as_view()),
    path('remove-user-from-group/', RemoveUserFromGroup.as_view(), name='remove-user-from-group'),
    path('get-groups-users/<int:pk>/', GroupsUsersView.as_view()),
]