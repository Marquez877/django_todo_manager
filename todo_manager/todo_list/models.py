from django.db import models
from django.utils import timezone

# Create your models here.

class Category(models.Model):
    """Модель категории задач"""
    name = models.CharField(max_length=100, unique=True, verbose_name='Название')
    color = models.CharField(max_length=7, default='#007bff', verbose_name='Цвет')
    description = models.TextField(blank=True, verbose_name='Описание')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Создано')
    
    class Meta:
        verbose_name = 'Категория'
        verbose_name_plural = 'Категории'
        ordering = ['name']
    
    def __str__(self):
        return self.name

class ToDoItem(models.Model):
    """Модель задачи"""
    
    PRIORITY_CHOICES = [
        ('low', 'Низкий'),
        ('medium', 'Средний'),
        ('high', 'Высокий'),
        ('urgent', 'Срочный'),
    ]
    
    class Meta:
        verbose_name = 'Задача'
        verbose_name_plural = 'Задачи'
        ordering = ['-created_at']
    
    title = models.CharField(max_length=200, verbose_name='Название')
    done = models.BooleanField(default=False, verbose_name='Выполнено')
    category = models.ForeignKey(
        Category, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        verbose_name='Категория'
    )
    priority = models.CharField(
        max_length=10, 
        choices=PRIORITY_CHOICES, 
        default='medium', 
        verbose_name='Приоритет'
    )
    due_date = models.DateTimeField(
        null=True, 
        blank=True, 
        verbose_name='Срок выполнения'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Создано')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Обновлено')
    
    def __str__(self):
        return self.title
    
    @property
    def is_overdue(self):
        """Проверка, просрочена ли задача"""
        if self.due_date and not self.done:
            return timezone.now() > self.due_date
        return False
    
    @property
    def priority_badge_class(self):
        """CSS класс для бейджа приоритета"""
        priority_classes = {
            'low': 'bg-secondary',
            'medium': 'bg-primary',
            'high': 'bg-warning',
            'urgent': 'bg-danger',
        }
        return priority_classes.get(self.priority, 'bg-secondary')