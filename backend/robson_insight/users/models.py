from django.db import models
from django.contrib.auth.models import User

class Hospital(models.Model):
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
    hospital = models.ForeignKey(
        to=Hospital,
        on_delete=models.CASCADE,
    )
    
    def __str__(self):
        return f'{self.user.first_name} {self.user.last_name}'
    
    
class Administrator(UserProfile):
    
    def __str__(self):
        return f'Administrator {super().__str__()}'
    
    class Meta:
        verbose_name_plural = "Administrators"
