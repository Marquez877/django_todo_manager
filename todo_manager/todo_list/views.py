from django.shortcuts import render, redirect, get_object_or_404
from django.views.generic import ListView
from django.contrib import messages
from django.views.decorators.http import require_POST
from django.http import JsonResponse
from django.utils import timezone
from django.db.models import Q
from .models import ToDoItem, Category
from .forms import TodoForm, TodoFormEdit, CategoryForm

def index(request):
    """Главная страница со списком задач и фильтрацией"""
    todos = ToDoItem.objects.all()
    categories = Category.objects.all()
    
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
    
    form = TodoForm()
    
    if request.method == 'POST':
        form = TodoForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Задача добавлена успешно!')
            return redirect('todo_list:index')
        else:
            messages.error(request, 'Ошибка при добавлении задачи. Проверьте данные.')
    
    context = {
        'todos': todos,
        'categories': categories,
        'form': form,
        'total_todos': ToDoItem.objects.count(),
        'completed_todos': ToDoItem.objects.filter(done=True).count(),
        'pending_todos': ToDoItem.objects.filter(done=False).count(),
        'overdue_todos': ToDoItem.objects.filter(
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

def delete_todo(request, todo_id):
    """Удаление задачи"""
    todo = get_object_or_404(ToDoItem, id=todo_id)
    todo_title = todo.title
    todo.delete()
    messages.success(request, f'Задача "{todo_title}" удалена!')
    return redirect('todo_list:index')

def edit_todo(request, todo_id):
    """Редактирование задачи"""
    todo = get_object_or_404(ToDoItem, id=todo_id)
    
    if request.method == 'POST':
        form = TodoFormEdit(request.POST, instance=todo)
        if form.is_valid():
            form.save()
            messages.success(request, f'Задача "{todo.title}" обновлена!')
            return redirect('todo_list:index')
        else:
            messages.error(request, 'Ошибка при обновлении задачи.')
    else:
        form = TodoFormEdit(instance=todo)

    context = {
        'form': form,
        'todo': todo
    }
    return render(request, 'todo_list/edit.html', context)

@require_POST 
def toggle_todo(request, todo_id):
    """AJAX переключение статуса задачи"""
    todo = get_object_or_404(ToDoItem, id=todo_id)
    todo.done = not todo.done
    todo.save()
    
    return JsonResponse({
        'success': True,
        'done': todo.done,
        'todo_id': todo.id,
        'message': f'Задача {"выполнена" if todo.done else "возвращена в работу"}'
    })

def categories(request):
    """Управление категориями"""
    categories = Category.objects.all()
    form = CategoryForm()
    
    if request.method == 'POST':
        form = CategoryForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Категория создана!')
            return redirect('todo_list:categories')
        else:
            messages.error(request, 'Ошибка при создании категории.')
    
    context = {
        'categories': categories,
        'form': form
    }
    return render(request, 'todo_list/categories.html', context)

def delete_category(request, category_id):
    """Удаление категории"""
    category = get_object_or_404(Category, id=category_id)
    category_name = category.name
    category.delete()
    messages.success(request, f'Категория "{category_name}" удалена!')
    return redirect('todo_list:categories')
    
