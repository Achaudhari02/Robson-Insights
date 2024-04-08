from django.db import models
from django.contrib.auth.models import User

class Hospital(models.Model):
    name = models.CharField(
        max_length=100,
    )
    
    def __str__(self):
        return f'{self.name}'

class BaseUser(User):
    hospital = models.ForeignKey(
        to=Hospital,
        on_delete=models.CASCADE,
    )
    
    def __str__(self):
        return f'{self.first_name} {self.last_name}'
    
    class Meta:
        verbose_name_plural = "Base Users"
    
class Administrator(BaseUser):
    
    def __str__(self):
        return f'Administrator {super().__str__()}'
    
    class Meta:
        verbose_name_plural = "Administrators"
