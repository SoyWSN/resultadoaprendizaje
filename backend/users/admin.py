from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from users.models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'username', 'first_name', 'last_name', 'telefono', 'is_staff')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Información de Contacto Extra', {'fields': ('telefono',)}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Información de Contacto Extra', {'fields': ('telefono',)}),
    )
