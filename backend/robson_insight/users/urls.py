from django.urls import path
from .views import *


app_name = 'users'
urlpatterns = [
    path('', UserProfileList.as_view()),
    path('<int:pk>/', UserProfileDetail.as_view()),
]