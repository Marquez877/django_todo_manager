from django.urls import path
from . import views

app_name = 'todo_list'

urlpatterns = [
    # Аутентификация
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    
    # Основные функции
    path('', views.index, name='index'),
    path('todo/create/', views.create_todo, name='create_todo'),
    path('todo/<int:todo_id>/edit/', views.edit_todo, name='edit_todo'),
    path('todo/<int:todo_id>/delete/', views.delete_todo, name='delete_todo'),
    path('todo/<int:todo_id>/toggle/', views.toggle_todo, name='toggle_todo'),
    
    # Категории
    path('categories/', views.categories, name='categories'),
    path('categories/create/', views.create_category, name='create_category'),
    path('categories/<int:category_id>/edit/', views.edit_category, name='edit_category'),
    path('categories/<int:category_id>/delete/', views.delete_category, name='delete_category'),
    
    # AJAX endpoints
    path('ajax/todos/', views.ajax_todos, name='ajax_todos'),
    path('ajax/categories/', views.ajax_categories, name='ajax_categories'),
]
