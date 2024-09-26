from django.urls import path
from .views import *


app_name = 'users'

urlpatterns = [
    path('', UserProfileListView.as_view()),
    path('<int:pk>/', UserProfileDetailView.as_view()),
    path('groups/', GroupListCreateView.as_view()),
    path('groups/<int:pk>/', UserProfileInGroupList.as_view()),
    path('add-user-to-group/', AddUserToGroupView.as_view(), name='add-user-to-group'),
    path('remove-user-from-group/', RemoveUserFromGroup.as_view(), name='remove-user-from-group'),
]