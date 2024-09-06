from django.urls import path
from .views import *


app_name = 'users'
urlpatterns = [
    path('', UserProfileList.as_view()),
    path('<int:pk>/', UserProfileDetail.as_view()),
    path('groups/', GroupListCreate.as_view()),
    path('groups/<int:pk>/', GroupListCreate.as_view()),
    path('add-user-to-group/', AddUserToGroupView.as_view(), name='add-user-to-group'),
]