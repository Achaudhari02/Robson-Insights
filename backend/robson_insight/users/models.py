from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError

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
    is_admin = models.BooleanField(
        default=False,
    )

    class Meta:
        unique_together = ('user', 'group')

    def __str__(self):
        return f'{self.user.username} - {self.group.name}{" (Admin)" if self.is_admin else ""}'
    
    def clean(self):
        # Check if the current user is marked as admin
        if self.is_admin:
            # Ensure no other admin exists for the same group
            if UserProfile.objects.filter(group=self.group, is_admin=True).exclude(pk=self.pk).exists():
                raise ValidationError(f'There can only be one admin for the group "{self.group.name}".')

    def save(self, *args, **kwargs):
        # Run the custom validation before saving
        self.clean()
        super(UserProfile, self).save(*args, **kwargs)
