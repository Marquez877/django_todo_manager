from django.contrib import admin
from .models import ToDoItem, Category

# Register your models here.

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'color', 'created_at')
    list_display_links = ('name',)
    search_fields = ('name', 'description')
    readonly_fields = ('created_at',)

@admin.register(ToDoItem)
class ToDoItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'category', 'priority', 'done', 'due_date', 'created_at')
    list_display_links = ('id', 'title')
    list_filter = ('done', 'priority', 'category', 'created_at')
    search_fields = ('title',)
    list_editable = ('done', 'priority')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('title', 'done')
        }),
        ('Детали', {
            'fields': ('category', 'priority', 'due_date')
        }),
        ('Системная информация', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )