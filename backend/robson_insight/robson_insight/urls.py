from django.contrib import admin
from django.urls import path, include
from users.views import LoginView, LogoutView
from .views import *

urlpatterns = [
    path("admin/", admin.site.urls),
    
    # Base Views
    path("", index_view, name="index"),
    
    # App Views
    path("users/", include("users.urls", namespace="users")),
    path("survey/", include("survey.urls", namespace="survey")),
     path('login/', LoginView.as_view(), name='login'),
     path('logout/', LogoutView.as_view(), name='logout'),
]
