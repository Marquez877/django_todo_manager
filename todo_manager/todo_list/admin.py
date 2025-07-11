from django.contrib import admin
from .models import ToDoItem

# Register your models here.

@admin.register(ToDoItem)
class ToDoItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'done', 'created_at', 'updated_at')
    list_display_links = ('id', 'title')
    list_filter = ('done', 'created_at')
    search_fields = ('title',)
    list_editable = ('done',)
    readonly_fields = ('created_at', 'updated_at')