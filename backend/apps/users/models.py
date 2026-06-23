"""User model for Kenya Finance App."""
import uuid
from django.contrib.auth.models import AbstractUser, UserManager as DefaultUserManager
from django.db import models


class UserManager(DefaultUserManager):
    """Custom user manager using email as the unique identifier."""
    
    def create_user(self, email, password=None, **extra_fields):
        """Create and save a regular user."""
        if not email:
            raise ValueError('Email is required')
        
        email = self.normalize_email(email)
        extra_fields.setdefault('username', email)  # Use email as username
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        """Create and save a superuser."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True')
        
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    """
    Custom user model with additional fields for personal finance tracking.
    
    Attributes:
        id: UUID primary key (non-enumerable)
        email: Email address (unique login field)
        display_name: User's chosen name (for dashboard greeting)
        expected_monthly_income: User's expected monthly income in Ksh (used for ratio calculations)
        partner_user: Optional link to another user for shared financial view
        created_at: Account creation timestamp
        updated_at: Last modification timestamp
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    display_name = models.CharField(max_length=100, blank=True)
    expected_monthly_income = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        help_text="Expected monthly income in Ksh (used for ratio calculations)"
    )
    partner_user = models.OneToOneField(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='partner',
        help_text="Link to partner's account for shared financial view"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []  # No additional required fields for createsuperuser
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    @property
    def has_partner(self) -> bool:
        """Check if the user is linked to a partner."""
        return self.partner_user is not None or hasattr(self, 'partner')

    def __str__(self) -> str:
        return f"{self.display_name} ({self.email})"
    
    def save(self, *args, **kwargs):
        """Ensure email is used as username."""
        if not self.username:
            self.username = self.email
        super().save(*args, **kwargs)


class PartnerInvite(models.Model):
    """
    Invitation to share financial data with another user.
    
    Attributes:
        id: UUID primary key
        inviter: The user sending the invitation
        invitee_email: The email address of the person being invited
        status: pending / accepted / rejected / cancelled
        created_at: When the invite was sent
    """
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    inviter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_invites')
    invitee_email = models.EmailField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Partner Invite'
        verbose_name_plural = 'Partner Invites'
        unique_together = ('inviter', 'invitee_email', 'status') # Prevent duplicate pending invites
    
    def __str__(self) -> str:
        return f"Invite from {self.inviter.email} to {self.invitee_email} ({self.status})"
