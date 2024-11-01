from django.urls import path
from .views import *


app_name = 'survey'
urlpatterns = [
    path('entries/', EntryListView.as_view()),
    path('entries/upload/', EntryListView.as_view(), name='entry-upload'),
    path('entries/filter/<int:pk>/', EntryFilterListView.as_view()),
    path('entries/<int:pk>/', EntryDetailView.as_view()),
    path('filters/', FilterConfigurationListCreateView.as_view()),
    path('filters/<int:pk>/', FilterConfigurationDetailView.as_view()),
    path('create-configuration/', CreateConfiguration.as_view(), name = 'create-configuration'),
    path('remove-group-from-configuration/', RemoveGroupFromConfiguration.as_view()),
    path('add-group-to-configuration/', AddGroupToConfiguration.as_view()),
]