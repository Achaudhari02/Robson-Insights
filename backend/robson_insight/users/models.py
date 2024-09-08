from django.db import models
from django.contrib.auth.models import User

class Group(models.Model):
    name = models.CharField(
        max_length=100,
    )
    
    def __str__(self):
        return f'{self.name}'

class UserProfile(models.Model):
    user = models.ForeignKey(
        to=User,
        on_delete=models.CASCADE,
    )
    group = models.ForeignKey(
        to=Group,
        on_delete=models.CASCADE,
    )
    
    class Meta:
        unique_together = ('user', 'group')
    
    def __str__(self):
        return f'{self.user.username} - {self.group.name}'
    
    
class Administrator(UserProfile):
    
    def __str__(self):
        return f'Administrator {super().__str__()}'
    
    class Meta:
        verbose_name_plural = "Administrators"
