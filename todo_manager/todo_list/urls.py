from django.urls import path
from . import views

app_name = 'todo_list'

urlpatterns = [
    path('', views.index, name='index'),
    path('delete/<int:todo_id>/', views.delete_todo, name='delete_todo'),
    path('edit/<int:todo_id>/', views.edit_todo, name='edit_todo'),
    path('toggle/<int:todo_id>/', views.toggle_todo, name='toggle_todo'),
    path('categories/', views.categories, name='categories'),
    path('categories/delete/<int:category_id>/', views.delete_category, name='delete_category'),
]
