from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth.models import User
from .models import ToDoItem, Category

class CustomUserCreationForm(UserCreationForm):
    """Кастомная форма регистрации"""
    email = forms.EmailField(required=True)
    first_name = forms.CharField(max_length=30, required=False)
    last_name = forms.CharField(max_length=30, required=False)
    
    class Meta:
        model = User
        fields = ("username", "email", "first_name", "last_name", "password1", "password2")
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            field.widget.attrs.update({'class': 'form-control'})
        
        self.fields['username'].widget.attrs.update({'placeholder': 'Имя пользователя'})
        self.fields['email'].widget.attrs.update({'placeholder': 'Email'})
        self.fields['first_name'].widget.attrs.update({'placeholder': 'Имя (необязательно)'})
        self.fields['last_name'].widget.attrs.update({'placeholder': 'Фамилия (необязательно)'})
        self.fields['password1'].widget.attrs.update({'placeholder': 'Пароль'})
        self.fields['password2'].widget.attrs.update({'placeholder': 'Подтвердите пароль'})

class CustomAuthenticationForm(AuthenticationForm):
    """Кастомная форма входа"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['username'].widget.attrs.update({
            'class': 'form-control',
            'placeholder': 'Имя пользователя'
        })
        self.fields['password'].widget.attrs.update({
            'class': 'form-control',
            'placeholder': 'Пароль'
        })

class TodoForm(forms.ModelForm):
    """Форма для создания новых задач"""
    
    def __init__(self, user=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if user:
            # Фильтруем категории только для текущего пользователя
            self.fields['category'].queryset = Category.objects.filter(user=user)
    
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
    
    def __init__(self, user=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if user:
            # Фильтруем категории только для текущего пользователя
            self.fields['category'].queryset = Category.objects.filter(user=user)
    
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