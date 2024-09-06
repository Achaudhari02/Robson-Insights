from django.db import models
from django.contrib.auth.models import User

class Group(models.Model):
    name = models.CharField(
        max_length=100,
    )
    
    def __str__(self):
        return f'{self.name}'

class UserProfile(models.Model):
    user = models.OneToOneField(
        to=User,
        on_delete=models.CASCADE,
    )
    group = models.ForeignKey(
        to=Group,
        on_delete=models.CASCADE,
    )
    
    def __str__(self):
        return f'{self.user.first_name} {self.user.last_name}'
    
    
class Administrator(UserProfile):
    
    def __str__(self):
        return f'Administrator {super().__str__()}'
    
    class Meta:
        verbose_name_plural = "Administrators"
