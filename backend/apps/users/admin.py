from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DefaultUserAdmin
from .models import User

@admin.register(User)
class UserAdmin(DefaultUserAdmin):
    """Custom UserAdmin for the Kenya Finance App User model."""
    list_display = ('email', 'display_name', 'expected_monthly_income', 'is_staff', 'created_at')
    search_fields = ('email', 'display_name')
    ordering = ('-created_at',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('display_name', 'expected_monthly_income', 'partner_user')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'display_name', 'password', 'password_confirm'),
        }),
    )
