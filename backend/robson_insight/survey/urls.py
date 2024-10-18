from django.urls import path
from .views import *


app_name = 'survey'
urlpatterns = [
    path('entries/', EntryListView.as_view()),
    path('entries/filter/<int:pk>/', EntryFilterListView.as_view()),
    path('entries/<int:pk>/', EntryDetailView.as_view()),
    path('filters/', FilterConfigurationListCreateView.as_view()),
    path('filters/<int:pk>/', FilterConfigurationDetailView.as_view()),
]