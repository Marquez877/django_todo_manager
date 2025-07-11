from django.db import models
from django.utils import timezone

# Create your models here.

class ToDoItem(models.Model):
    class Meta:
        verbose_name = 'To-Do Item'
        verbose_name_plural = 'To-Do Items'
        ordering = ['-created_at']
    
    title = models.CharField(max_length=250)
    done = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title