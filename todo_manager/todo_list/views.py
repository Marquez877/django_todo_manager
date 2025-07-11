from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.http import JsonResponse
from django.utils import timezone
from django.db.models import Q
from .models import ToDoItem, Category
from .forms import TodoForm, TodoFormEdit, CategoryForm, CustomUserCreationForm, CustomAuthenticationForm

def home(request):
    """Главная страница"""
    if request.user.is_authenticated:
        # Если пользователь авторизован, показываем статистику
        user_todos = ToDoItem.objects.filter(user=request.user)
        total_todos = user_todos.count()
        completed_todos = user_todos.filter(done=True).count()
        pending_todos = user_todos.filter(done=False).count()
        overdue_todos = user_todos.filter(
            done=False, 
            due_date__lt=timezone.now()
        ).count()
        
        # Вычисляем процент выполнения
        progress_percent = 0
        if total_todos > 0:
            progress_percent = round((completed_todos / total_todos) * 100, 1)
        
        context = {
            'total_todos': total_todos,
            'completed_todos': completed_todos,
            'pending_todos': pending_todos,
            'overdue_todos': overdue_todos,
            'progress_percent': progress_percent,
        }
    else:
        context = {}
    return render(request, 'components/index.html', context)

def register_view(request):
    """Регистрация пользователя"""
    if request.user.is_authenticated:
        return redirect('todo_list:index')
        
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            # Создаем базовые категории для нового пользователя
            Category.objects.create(
                name='Работа', 
                color='#007bff', 
                description='Рабочие задачи',
                user=user
            )
            Category.objects.create(
                name='Личное', 
                color='#28a745', 
                description='Личные дела',
                user=user
            )
            Category.objects.create(
                name='Покупки', 
                color='#ffc107', 
                description='Список покупок',
                user=user
            )
            
            username = form.cleaned_data.get('username')
            messages.success(request, f'Аккаунт для {username} создан! Добро пожаловать!')
            login(request, user)
            return redirect('todo_list:index')
    else:
        form = CustomUserCreationForm()
    
    return render(request, 'auth/register.html', {'form': form})

def login_view(request):
    """Вход пользователя"""
    if request.user.is_authenticated:
        return redirect('todo_list:index')
        
    if request.method == 'POST':
        form = CustomAuthenticationForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                messages.success(request, f'Добро пожаловать, {username}!')
                next_url = request.GET.get('next', 'todo_list:index')
                return redirect(next_url)
        else:
            messages.error(request, 'Неверное имя пользователя или пароль.')
    else:
        form = CustomAuthenticationForm()
    
    return render(request, 'auth/login.html', {'form': form})

def logout_view(request):
    """Выход пользователя"""
    logout(request)
    messages.success(request, 'Вы успешно вышли из системы.')
    return redirect('home')

@login_required
def index(request):
    """Главная страница со списком задач и фильтрацией"""
    todos = ToDoItem.objects.filter(user=request.user)
    categories = Category.objects.filter(user=request.user)
    
    # Фильтрация
    category_filter = request.GET.get('category')
    priority_filter = request.GET.get('priority')
    status_filter = request.GET.get('status')
    search_query = request.GET.get('search')
    
    if category_filter:
        todos = todos.filter(category_id=category_filter)
    
    if priority_filter:
        todos = todos.filter(priority=priority_filter)
    
    if status_filter == 'completed':
        todos = todos.filter(done=True)
    elif status_filter == 'pending':
        todos = todos.filter(done=False)
    elif status_filter == 'overdue':
        todos = todos.filter(done=False, due_date__lt=timezone.now())
    
    if search_query:
        todos = todos.filter(title__icontains=search_query)
    
    # Сортировка
    sort_by = request.GET.get('sort', '-created_at')
    todos = todos.order_by(sort_by)
    
    form = TodoForm(user=request.user)
    
    if request.method == 'POST':
        form = TodoForm(user=request.user, data=request.POST)
        if form.is_valid():
            todo = form.save(commit=False)
            todo.user = request.user
            todo.save()
            messages.success(request, 'Задача добавлена успешно!')
            return redirect('todo_list:index')
        else:
            messages.error(request, 'Ошибка при добавлении задачи. Проверьте данные.')
    
    user_todos = ToDoItem.objects.filter(user=request.user)
    context = {
        'todos': todos,
        'categories': categories,
        'form': form,
        'total_todos': user_todos.count(),
        'completed_todos': user_todos.filter(done=True).count(),
        'pending_todos': user_todos.filter(done=False).count(),
        'overdue_todos': user_todos.filter(
            done=False, 
            due_date__lt=timezone.now()
        ).count(),
        'current_filters': {
            'category': category_filter,
            'priority': priority_filter,
            'status': status_filter,
            'search': search_query,
            'sort': sort_by,
        }
    }
    return render(request, 'todo_list/index.html', context)

@login_required
def delete_todo(request, todo_id):
    """Удаление задачи"""
    todo = get_object_or_404(ToDoItem, id=todo_id, user=request.user)
    todo_title = todo.title
    todo.delete()
    messages.success(request, f'Задача "{todo_title}" удалена!')
    return redirect('todo_list:index')

@login_required
def edit_todo(request, todo_id):
    """Редактирование задачи"""
    todo = get_object_or_404(ToDoItem, id=todo_id, user=request.user)
    
    if request.method == 'POST':
        form = TodoFormEdit(user=request.user, data=request.POST, instance=todo)
        if form.is_valid():
            form.save()
            messages.success(request, f'Задача "{todo.title}" обновлена!')
            return redirect('todo_list:index')
        else:
            messages.error(request, 'Ошибка при обновлении задачи.')
    else:
        form = TodoFormEdit(user=request.user, instance=todo)

    context = {
        'form': form,
        'todo': todo
    }
    return render(request, 'todo_list/edit.html', context)

@login_required
@require_POST 
def toggle_todo(request, todo_id):
    """AJAX переключение статуса задачи"""
    todo = get_object_or_404(ToDoItem, id=todo_id, user=request.user)
    todo.done = not todo.done
    todo.save()
    
    return JsonResponse({
        'success': True,
        'done': todo.done,
        'todo_id': todo.id,
        'message': f'Задача {"выполнена" if todo.done else "возвращена в работу"}'
    })

@login_required
def categories(request):
    """Управление категориями"""
    categories = Category.objects.filter(user=request.user)
    form = CategoryForm()
    
    if request.method == 'POST':
        form = CategoryForm(request.POST)
        if form.is_valid():
            category = form.save(commit=False)
            category.user = request.user
            category.save()
            messages.success(request, 'Категория создана!')
            return redirect('todo_list:categories')
        else:
            messages.error(request, 'Ошибка при создании категории.')
    
    context = {
        'categories': categories,
        'form': form
    }
    return render(request, 'todo_list/categories.html', context)

@login_required
def delete_category(request, category_id):
    """Удаление категории"""
    category = get_object_or_404(Category, id=category_id, user=request.user)
    category_name = category.name
    category.delete()
    messages.success(request, f'Категория "{category_name}" удалена!')
    return redirect('todo_list:categories')

@login_required
def create_todo(request):
    """Создание новой задачи"""
    if request.method == 'POST':
        form = TodoForm(request.POST, user=request.user)
        if form.is_valid():
            todo = form.save(commit=False)
            todo.user = request.user
            todo.save()
            
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': True,
                    'message': 'Задача создана!',
                    'refresh_todos': True
                })
            
            messages.success(request, 'Задача создана!')
            return redirect('todo_list:index')
        else:
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': False,
                    'message': 'Ошибка при создании задачи',
                    'errors': form.errors
                })
            messages.error(request, 'Ошибка при создании задачи.')
    
    return redirect('todo_list:index')

@login_required
def create_category(request):
    """Создание новой категории"""
    if request.method == 'POST':
        form = CategoryForm(request.POST, user=request.user)
        if form.is_valid():
            category = form.save(commit=False)
            category.user = request.user
            category.save()
            
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': True,
                    'message': 'Категория создана!',
                    'refresh_categories': True
                })
            
            messages.success(request, 'Категория создана!')
            return redirect('todo_list:categories')
        else:
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': False,
                    'message': 'Ошибка при создании категории',
                    'errors': form.errors
                })
            messages.error(request, 'Ошибка при создании категории.')
    
    return redirect('todo_list:categories')

@login_required
def edit_category(request, category_id):
    """Редактирование категории"""
    category = get_object_or_404(Category, id=category_id, user=request.user)
    
    if request.method == 'POST':
        form = CategoryForm(request.POST, user=request.user, instance=category)
        if form.is_valid():
            form.save()
            
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': True,
                    'message': 'Категория обновлена!',
                    'refresh_categories': True
                })
            
            messages.success(request, 'Категория обновлена!')
            return redirect('todo_list:categories')
        else:
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': False,
                    'message': 'Ошибка при обновлении категории',
                    'errors': form.errors
                })
            messages.error(request, 'Ошибка при обновлении категории.')
    
    return redirect('todo_list:categories')

@login_required
def ajax_todos(request):
    """AJAX endpoint для получения списка задач"""
    todos = ToDoItem.objects.filter(user=request.user).select_related('category').order_by('-created_at')
    
    # Применяем фильтры если есть
    filter_type = request.GET.get('filter', 'all')
    if filter_type == 'completed':
        todos = todos.filter(done=True)
    elif filter_type == 'pending':
        todos = todos.filter(done=False)
    elif filter_type == 'overdue':
        todos = todos.filter(done=False, due_date__lt=timezone.now())
    
    category_id = request.GET.get('category')
    if category_id and category_id != 'all':
        todos = todos.filter(category_id=category_id)
    
    priority = request.GET.get('priority')
    if priority and priority != 'all':
        todos = todos.filter(priority=priority)
    
    # Рендерим HTML для задач
    html = render(request, 'todo_list/partials/todos_list.html', {'todos': todos}).content.decode('utf-8')
    
    return JsonResponse({
        'success': True,
        'html': html,
        'count': todos.count()
    })

@login_required
def ajax_categories(request):
    """AJAX endpoint для получения списка категорий"""
    categories = Category.objects.filter(user=request.user).order_by('name')
    
    # Рендерим HTML для категорий
    html = render(request, 'todo_list/partials/categories_list.html', {'categories': categories}).content.decode('utf-8')
    
    # Также возвращаем данные для обновления селектов
    categories_data = [
        {'id': cat.id, 'name': cat.name, 'color': cat.color}
        for cat in categories
    ]
    
    return JsonResponse({
        'success': True,
        'html': html,
        'categories': categories_data,
        'count': categories.count()
    })

