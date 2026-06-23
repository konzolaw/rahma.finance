"""User model serializers for authentication and profile management."""
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from decimal import Decimal

from .models import User


class UserSerializer(serializers.ModelSerializer):
    """Serialize User profile data (read-only for most users)."""
    
    class Meta:
        model = User
        fields = ['id', 'email', 'display_name', 'expected_monthly_income', 'partner_user', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serialize user registration (create new user account)."""
    
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        help_text="Password must be at least 8 characters"
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        help_text="Confirm password"
    )
    
    class Meta:
        model = User
        fields = ['email', 'display_name', 'expected_monthly_income', 'password', 'password_confirm']
    
    def validate(self, data):
        """Validate that passwords match."""
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError(
                {"password": "Passwords do not match."}
            )
        
        if 'expected_monthly_income' in data and data['expected_monthly_income'] is not None:
            if data['expected_monthly_income'] < 0:
                raise serializers.ValidationError(
                    {"expected_monthly_income": "Expected monthly income cannot be negative."}
                )
        
        return data
    
    def create(self, validated_data):
        """Create new user with hashed password."""
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        user = User.objects.create_user(**validated_data, password=password)
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serialize user profile updates (exclude sensitive fields)."""
    
    class Meta:
        model = User
        fields = ['display_name', 'expected_monthly_income', 'partner_user']
        read_only_fields = []
    
    def validate_expected_monthly_income(self, value):
        """Validate that expected monthly income is non-negative."""
        if value < 0:
            raise serializers.ValidationError(
                "Expected monthly income cannot be negative."
            )
        return value


from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT serializer to accept 'email' instead of 'username'."""
    username_field = 'email'

    def validate(self, attrs):
        # Map 'email' to 'username' for the parent serializer if 'username' is missing
        if 'email' in attrs and 'username' not in attrs:
            attrs['username'] = attrs['email']
        
        data = super().validate(attrs)
        
        # Add user data to response
        user_data = UserSerializer(self.user).data
        data['user'] = user_data
        
        # Return in standard ApiResponse format
        return {
            'status': 'success',
            'message': 'Login successful',
            'data': {
                'user': user_data,
                'access_token': data.pop('access'),
                'refresh_token': data.pop('refresh'),
            }
        }

class UserDetailSerializer(serializers.ModelSerializer):
    """Serialize complete user details for authenticated requests."""
    
    class Meta:
        model = User
        fields = ['id', 'email', 'display_name', 'expected_monthly_income', 'partner_user', 'created_at', 'updated_at']
        read_only_fields = ['id', 'email', 'created_at', 'updated_at']


from .models import PartnerInvite

class PartnerInviteSerializer(serializers.ModelSerializer):
    """Serialize partner invitation data."""
    inviter_email = serializers.EmailField(source='inviter.email', read_only=True)
    inviter_name = serializers.CharField(source='inviter.display_name', read_only=True)
    
    class Meta:
        model = PartnerInvite
        fields = ['id', 'inviter_email', 'inviter_name', 'invitee_email', 'status', 'created_at']
        read_only_fields = ['id', 'status', 'created_at']
