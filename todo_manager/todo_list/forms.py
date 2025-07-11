from django import forms
from .models import ToDoItem, Category

class TodoForm(forms.ModelForm):
    """Форма для создания новых задач"""
    
    class Meta:
        model = ToDoItem
        fields = ['title', 'category', 'priority', 'due_date']
        widgets = {
            'title': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Введите новую задачу...',
                'required': True,
                'maxlength': '200',
            }),
            'category': forms.Select(attrs={
                'class': 'form-select'
            }),
            'priority': forms.Select(attrs={
                'class': 'form-select'
            }),
            'due_date': forms.DateTimeInput(attrs={
                'type': 'datetime-local',
                'class': 'form-control'
            })
        }
        labels = {
            'title': 'Название задачи',
            'category': 'Категория',
            'priority': 'Приоритет',
            'due_date': 'Срок выполнения'
        }
    
    def clean_title(self):
        title = self.cleaned_data.get('title')
        if not title or len(title.strip()) < 3:
            raise forms.ValidationError('Название задачи должно содержать минимум 3 символа.')
        return title.strip()

class TodoFormEdit(forms.ModelForm):
    """Форма для редактирования задач"""
    
    class Meta:
        model = ToDoItem
        fields = ['title', 'done', 'category', 'priority', 'due_date']
        widgets = {
            'title': forms.TextInput(attrs={
                'class': 'form-control',
                'required': True,
                'maxlength': '200',
            }),
            'done': forms.CheckboxInput(attrs={
                'class': 'form-check-input'
            }),
            'category': forms.Select(attrs={
                'class': 'form-select'
            }),
            'priority': forms.Select(attrs={
                'class': 'form-select'
            }),
            'due_date': forms.DateTimeInput(attrs={
                'type': 'datetime-local',
                'class': 'form-control'
            })
        }
        labels = {
            'title': 'Название задачи',
            'done': 'Выполнено',
            'category': 'Категория',
            'priority': 'Приоритет',
            'due_date': 'Срок выполнения'
        }
    
    def clean_title(self):
        title = self.cleaned_data.get('title')
        if not title or len(title.strip()) < 3:
            raise forms.ValidationError('Название задачи должно содержать минимум 3 символа.')
        return title.strip()

class CategoryForm(forms.ModelForm):
    """Форма для создания категорий"""
    
    class Meta:
        model = Category
        fields = ['name', 'color', 'description']
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Название категории'
            }),
            'color': forms.TextInput(attrs={
                'type': 'color',
                'class': 'form-control form-control-color'
            }),
            'description': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Описание категории (необязательно)'
            })
        }