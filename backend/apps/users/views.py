"""User authentication and profile views."""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate
from django.conf import settings
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

from .models import User, PartnerInvite
from .serializers import (
    UserSerializer,
    UserRegistrationSerializer,
    UserUpdateSerializer,
    UserDetailSerializer,
    PartnerInviteSerializer,
)


class PartnerViewSet(viewsets.ViewSet):
    """ViewSet for managing partner invitations and linking."""
    
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def invite(self, request):
        """Send a partner invitation."""
        invitee_email = request.data.get('email')
        if not invitee_email:
            return Response({'status': 'error', 'message': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        if invitee_email == request.user.email:
            return Response({'status': 'error', 'message': 'You cannot invite yourself'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if already has a partner
        if request.user.has_partner:
            return Response({'status': 'error', 'message': 'You already have a linked partner'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check for existing pending invite
        if PartnerInvite.objects.filter(inviter=request.user, invitee_email=invitee_email, status='pending').exists():
            return Response({'status': 'error', 'message': 'Invitation already sent'}, status=status.HTTP_400_BAD_REQUEST)
            
        invite = PartnerInvite.objects.create(
            inviter=request.user,
            invitee_email=invitee_email
        )
        
        return Response(
            {
                'status': 'success',
                'message': 'Invitation sent successfully',
                'data': PartnerInviteSerializer(invite).data
            },
            status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=['get'])
    def invites(self, request):
        """List received pending invitations."""
        invites = PartnerInvite.objects.filter(invitee_email=request.user.email, status='pending')
        return Response(
            {
                'status': 'success',
                'data': PartnerInviteSerializer(invites, many=True).data
            }
        )

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        """Accept a partner invitation."""
        try:
            invite = PartnerInvite.objects.get(id=pk, invitee_email=request.user.email, status='pending')
        except PartnerInvite.DoesNotExist:
            return Response({'status': 'error', 'message': 'Invitation not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Ensure both users are free
        if request.user.has_partner or invite.inviter.has_partner:
            invite.status = 'cancelled'
            invite.save()
            return Response({'status': 'error', 'message': 'One of the users is already linked to a partner'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Link users
        request.user.partner_user = invite.inviter
        request.user.save()
        
        invite.inviter.partner_user = request.user
        invite.inviter.save()
        
        invite.status = 'accepted'
        invite.save()
        
        return Response({'status': 'success', 'message': 'Partner linked successfully'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a partner invitation."""
        try:
            invite = PartnerInvite.objects.get(id=pk, invitee_email=request.user.email, status='pending')
        except PartnerInvite.DoesNotExist:
            return Response({'status': 'error', 'message': 'Invitation not found'}, status=status.HTTP_404_NOT_FOUND)
            
        invite.status = 'rejected'
        invite.save()
        return Response({'status': 'success', 'message': 'Invitation rejected'})

    @action(detail=False, methods=['post'])
    def unlink(self, request):
        """Remove partner link."""
        user = request.user
        partner = None
        
        if user.partner_user:
            partner = user.partner_user
        elif hasattr(user, 'partner'):
            partner = user.partner
            
        if not partner:
            return Response({'status': 'error', 'message': 'No partner linked'}, status=status.HTTP_400_BAD_REQUEST)
            
        user.partner_user = None
        user.save()
        
        partner.partner_user = None
        partner.save()
        
        return Response({'status': 'success', 'message': 'Partner unlinked successfully'})


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for user registration, authentication, and profile management."""
    
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'put', 'patch', 'delete']
    
    def get_permissions(self):
        """Allow unauthenticated users to register."""
        if self.action == 'create' or self.action == 'register':
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_serializer_class(self):
        """Use different serializers based on the action."""
        if self.action == 'create' or self.action == 'register':
            return UserRegistrationSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        elif self.action == 'retrieve':
            return UserDetailSerializer
        return UserSerializer
    
    def get_queryset(self):
        """Return only the authenticated user's profile."""
        if self.request.user.is_authenticated:
            return User.objects.filter(id=self.request.user.id)
        return User.objects.none()
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        """Register a new user account."""
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {
                    'status': 'success',
                    'message': 'User registered successfully.',
                    'data': {
                        'user': UserSerializer(user).data,
                    }
                },
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def profile(self, request):
        """Get authenticated user's profile."""
        user = request.user
        serializer = UserDetailSerializer(user)
        return Response(
            {
                'status': 'success',
                'message': 'Profile retrieved',
                'data': {
                    'user': serializer.data
                }
            },
            status=status.HTTP_200_OK
        )
    
    @action(detail=False, methods=['put', 'patch'])
    def update_profile(self, request):
        """Update authenticated user's profile."""
        user = request.user
        serializer = UserUpdateSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    'status': 'success',
                    'message': 'Profile updated successfully.',
                    'data': {
                        'user': UserDetailSerializer(user).data
                    }
                },
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def logout(self, request):
        """Logout user and clear refresh token cookie."""
        response = Response(
            {
                'status': 'success',
                'message': 'Successfully logged out.'
            },
            status=status.HTTP_200_OK
        )
        response.delete_cookie('refresh_token')
        # Also set a non-httpOnly cookie to false for frontend awareness
        response.set_cookie('is_logged_in', 'false', max_age=0)
        return response

    @action(detail=False, methods=['post'])
    def change_password(self, request):
        """Change user's password."""
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        
        if not authenticate(username=user.email, password=old_password):
            return Response(
                {
                    'status': 'error',
                    'message': 'Old password is incorrect.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.set_password(new_password)
        user.save()
        
        return Response(
            {
                'status': 'success',
                'message': 'Password changed successfully.'
            },
            status=status.HTTP_200_OK
        )


class CookieTokenObtainPairView(TokenObtainPairView):
    """
    Custom Login View that sets the refresh token in an httpOnly cookie.
    """
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            # Extract the refresh token from the validated data
            # Our CustomTokenObtainPairSerializer returns it in data['data']['refresh_token']
            refresh_token = response.data.get('data', {}).get('refresh_token')
            
            if refresh_token:
                # Set the httpOnly cookie
                response.set_cookie(
                    key='refresh_token',
                    value=refresh_token,
                    httponly=True,
                    secure=not settings.DEBUG,  # True in production
                    samesite='Lax',             # Lax is better for cross-site auth if needed, but 'Strict' is safer
                    max_age=7 * 24 * 60 * 60    # 7 days
                )
                
                # Set a non-httpOnly cookie for frontend hydration awareness
                response.set_cookie(
                    key='is_logged_in',
                    value='true',
                    httponly=False,
                    secure=not settings.DEBUG,
                    samesite='Lax',
                    max_age=7 * 24 * 60 * 60
                )
                
                # Optionally remove it from the response body to comply with "memory only" rule
                # but keep it if the frontend still expects it for initial setup
                # response.data['data'].pop('refresh_token')
                
        return response


class CookieTokenRefreshView(TokenRefreshView):
    """
    Custom Token Refresh View that reads the refresh token from an httpOnly cookie.
    """
    def post(self, request, *args, **kwargs):
        # Extract refresh token from cookie if not in body
        refresh_token = request.COOKIES.get('refresh_token')
        
        if refresh_token and 'refresh' not in request.data:
            # SimpleJWT's TokenRefreshSerializer expects 'refresh' in request.data
            request.data['refresh'] = refresh_token
            
        try:
            response = super().post(request, *args, **kwargs)
        except (InvalidToken, TokenError) as e:
            # If refresh fails, clear the cookies
            res = Response({'detail': str(e)}, status=status.HTTP_401_UNAUTHORIZED)
            res.delete_cookie('refresh_token')
            res.delete_cookie('is_logged_in')
            return res

        if response.status_code == 200:
            # If rotation is enabled, the new refresh token will be in response.data['refresh']
            # Note: TokenRefreshView's default response only has 'access' and 'refresh' (if rotated)
            new_refresh = response.data.get('refresh')
            if new_refresh:
                response.set_cookie(
                    key='refresh_token',
                    value=new_refresh,
                    httponly=True,
                    secure=not settings.DEBUG,
                    samesite='Lax',
                    max_age=7 * 24 * 60 * 60
                )
                # Ensure it's not in the body
                response.data.pop('refresh')
            
            # Wrap the response in our standard envelope
            response.data = {
                'status': 'success',
                'message': 'Token refreshed',
                'data': {
                    'access_token': response.data.get('access'),
                }
            }
            
        return response
