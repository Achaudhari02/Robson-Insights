from django.db import models

from users.models import BaseUser
    
    
class Entry(models.Model):
    CLASSIFICATIONS = [
    ("1", "Group 1"),
    ("2", "Group 2"),
    ("3", "Group 3"),
    ("4", "Group 4"),
    ("5", "Group 5"),
    ("6", "Group 6"),
    ("7", "Group 7"),
    ("8", "Group 8"),
    ("9", "Group 9"),
    ("10", "Group 10"),
]
    classification = models.CharField(
        choices=CLASSIFICATIONS,
        max_length=100,
    )
    user = models.ForeignKey(
        null=True,
        blank=True,
        to=BaseUser,
        on_delete=models.SET_NULL,
    )
    csection = models.BooleanField(
        default=False,
    )
    date = models.DateTimeField(
        auto_now_add=True,
    )
    
    def __str__(self):
        return f'{self.classification} {self.user}'
    
    class Meta:
        verbose_name_plural = "Entries"

    

