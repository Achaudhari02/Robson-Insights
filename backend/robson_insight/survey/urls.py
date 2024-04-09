from django.urls import path
from .views import EntryList, EntryDetail


app_name = 'survey'
urlpatterns = [
    path('entries/', EntryList.as_view()),
    path('entries/<int:pk>', EntryDetail.as_view()),
]