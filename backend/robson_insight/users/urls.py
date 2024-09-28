from django.urls import path
from .views import *


app_name = 'users'

urlpatterns = [
    path('', UserProfileListView.as_view()),
    path('<int:pk>/', UserProfileDetailView.as_view()),
    path('groups/', GroupListCreateView.as_view()),
    path('groups/<int:group_pk>/', GroupDetailView.as_view()),
    path('get-groups-users/<int:group_pk>', UserProfileInGroupListView.as_view()),
    path('add-user-to-group/', AddUserToGroupView.as_view(), name='add-user-to-group'),
    path('remove-user-from-group/', RemoveUserFromGroup.as_view(), name='remove-user-from-group'),
    path('groups/<int:pk>/change-admin/', ChangeGroupAdminView.as_view(), name='change-group-admin'),
    path('toggle-permissions/', TogglePermissionsView.as_view(), name='toggle-permissions'),
]
       
    ## Invitations
    path('invitations/', InviteListView.as_view(), name='invite-list'),
    path('create-invitation/<int:group_pk>/', InviteCreateView.as_view(), name='create-invite'),
    path('accept-invitation/<str:token>/', AcceptInviteView.as_view(), name='accept-invite'),
]
