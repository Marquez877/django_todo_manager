from django.shortcuts import render, redirect
from django.views.generic import ListView
from django.contrib import messages
from .models import ToDoItem

# Create your views here.

class TodoListView(ListView):
    model = ToDoItem
    template_name = 'todo_list/index.html'
    context_object_name = 'todos'
    
    def post(self, request, *args, **kwargs):
        title = request.POST.get('title')
        if title:
            ToDoItem.objects.create(title=title)
            messages.success(request, 'Todo item added successfully!')
        return redirect('todo_list:index')

def todo_list_view(request):
    todos = ToDoItem.objects.all()
    
    if request.method == 'POST':
        title = request.POST.get('title')
        if title:
            ToDoItem.objects.create(title=title)
            messages.success(request, 'Todo item added successfully!')
            return redirect('todo_list:index')
    
    context = {
        'todos': todos
    }
    return render(request, 'todo_list/index.html', context)
