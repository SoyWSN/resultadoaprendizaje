from rest_framework import status
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAdminUser, IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.hashers import make_password
import zeep
from users.models import User
from users.serializers import UserSerializer, RegisterUserSerializer

class UserApiViewSet(ModelViewSet):
    permission_classes = [IsAdminUser]
    serializer_class = UserSerializer
    queryset = User.objects.all()

    def create(self, request, *args, **kwargs):
        # Asegurar el hash de la contrasena al crear el usuario
        if 'password' in request.data and request.data['password']:
            request.data['password'] = make_password(request.data['password'])
        return super().create(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        if "password" in request.data:
            if request.data["password"]:
                request.data["password"] = make_password(request.data["password"])
            else:
                request.data.pop("password", None)
        return super().partial_update(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        if 'password' in request.data:
            if request.data['password']:
                request.data['password'] = make_password(request.data['password'])
            else:
                request.data.pop('password', None)
        return super().update(request, *args, **kwargs)

class UserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class RegisterUserView(ModelViewSet):
    permission_classes = [AllowAny]
    serializer_class = RegisterUserSerializer
    queryset = User.objects.all()

    def create(self, request, *args, **kwargs):
        serializer = RegisterUserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': 'Usuario registrado exitosamente',
                'user': {
                    'username': user.username,
                    'email': user.email,
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)

class SoapCountryInfoView(APIView):
    """
    Consumo de Web Service SOAP público utilizando la librería zeep.
    Servicio: CountryInfoService (Oorsprong)
    """
    permission_classes = [AllowAny]

    def get(self, request):
        country_code = request.query_params.get('code', 'MX').upper().strip()
        wsdl = 'http://webservices.oorsprong.org/websamples.countryinfo/CountryInfoService.wso?WSDL'
        try:
            client = zeep.Client(wsdl=wsdl)
            info = client.service.FullCountryInfo(country_code)
            return Response({
                'status': 'success',
                'service': 'CountryInfoService SOAP',
                'data': {
                    'iso_code': info.sISOCode if hasattr(info, 'sISOCode') else country_code,
                    'name': info.sName if hasattr(info, 'sName') else '',
                    'capital': info.sCapitalCity if hasattr(info, 'sCapitalCity') else '',
                    'phone_code': info.sPhoneCode if hasattr(info, 'sPhoneCode') else '',
                    'currency': info.sCurrencyISOCode if hasattr(info, 'sCurrencyISOCode') else '',
                    'flag_url': info.sCountryFlag if hasattr(info, 'sCountryFlag') else ''
                }
            })
        except Exception as e:
            return Response({
                'status': 'error',
                'message': f'Error consumiendo servicio SOAP: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

