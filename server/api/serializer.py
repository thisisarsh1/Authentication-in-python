from rest_framework import serializers
from .models import User
from django.core.mail import send_mail
import random
import datetime
from django.utils import timezone
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from testimonials.serializers import TestimonialSerializer
from portfolio.serializers import UserDetailsSerializer
from company.serializers import StudentsRegisteredSerializer, CompanyProfileSerializer
# from company.models import Company

class StudentSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True)
    otp = serializers.CharField(write_only=True, required=False)
    testimonial = TestimonialSerializer(many=True, read_only=True)
    userdetails = UserDetailsSerializer(many=True, read_only=True)
    interview_selected = serializers.SerializerMethodField()
    internship_under_review = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'profile_image',
            'name',
            'email',
            'password',
            'confirm_password',
            'otp',
            'is_staff',
            'is_company',
            'is_mentor',
            'testimonial',
            'userdetails',
            'interview_selected',
            'internship_under_review'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def get_interview_selected(self, obj):
        selected_internships = obj.internships_registered.filter(is_selected=True)
        return StudentsRegisteredSerializer(selected_internships, many=True).data

    def get_internship_under_review(self, obj):
        under_review_internships = obj.internships_registered.filter(is_selected=False)
        return StudentsRegisteredSerializer(under_review_internships, many=True).data

    def validate(self, data):
        password = data.get('password')
        confirm_password = data.pop('confirm_password', None)

        if password != confirm_password:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})

        return data

    def create(self, validated_data):
        otp = str(random.randint(1000, 9999))
        validated_data['otp'] = otp
        validated_data['otp_expiration'] = datetime.datetime.now() + datetime.timedelta(minutes=10)
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()

        if not user.is_company:
            from portfolio.models import UserDetails
            UserDetails.objects.create(
                user=user,
                name=user.name,
                email=user.email,
            )

        html_message = render_to_string('emails/registeration_otp.html', {'otp': otp})
        plain_message = strip_tags(html_message)

        send_mail(
            'Your OTP Code',
            plain_message,
            'codecell@eng.rizvi.edu.in',
            [validated_data['email']],
            fail_silently=False,
            html_message=html_message,
        )

        return user



class CompanySerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True)
    otp = serializers.CharField(write_only=True, required=False)
    testimonial = TestimonialSerializer(many=True, read_only=True)
    companies = CompanyProfileSerializer(many=True,read_only=True)
    class Meta:
        model = User
        fields = [
            'id',
            'name',
            'email',
            'profile_image',
            'password',
            'confirm_password',
            'otp',
            'is_staff',
            'testimonial',
            'is_company',
            'companies',
            'is_mentor'
            ]
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def validate(self, data):
        password = data.get('password')
        confirm_password = data.pop('confirm_password', None)

        if password != confirm_password:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})

        return data

    def create(self, validated_data):
        otp = str(random.randint(1000, 9999))
        validated_data['otp'] = otp
        validated_data['otp_expiration'] = datetime.datetime.now() + datetime.timedelta(minutes=10)
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()

        if user.is_company:
            from company.models import Company  # Avoid circular import
            Company.objects.create(
                name=user.name,  # Use the user's name as the company name by default
                user =user
            )
        html_message = render_to_string('emails/registeration_otp.html', {'otp': otp})
        plain_message = strip_tags(html_message)


        # Send email with OTP
        send_mail(
            'Your OTP Code',
            plain_message,
            'codecell@eng.rizvi.edu.in',  # Replace with your email
            [validated_data['email']],
            fail_silently=False,
            html_message=html_message,
        )

        return user

class MentorSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True)
    otp = serializers.CharField(write_only=True, required=False)
    testimonial = TestimonialSerializer(many=True, read_only=True)
    class Meta:
        model = User
        fields = [
            'id',
            'name',
            'email',
            'profile_image'
            'password',
            'confirm_password',
            'otp',
            'is_staff',
            'testimonial',
            'is_company',
            'is_mentor'
            ]
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def validate(self, data):
        password = data.get('password')
        confirm_password = data.pop('confirm_password', None)

        if password != confirm_password:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})

        return data

    def create(self, validated_data):
        otp = str(random.randint(1000, 9999))
        validated_data['otp'] = otp
        validated_data['otp_expiration'] = datetime.datetime.now() + datetime.timedelta(minutes=10)
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()

        if user.is_company:
            from company.models import Company  # Avoid circular import
            Company.objects.create(
                name=user.name,  # Use the user's name as the company name by default
                user =user
            )
        html_message = render_to_string('emails/registeration_otp.html', {'otp': otp})
        plain_message = strip_tags(html_message)


        # Send email with OTP
        send_mail(
            'Your OTP Code',
            plain_message,
            'codecell@eng.rizvi.edu.in',  # Replace with your email
            [validated_data['email']],
            fail_silently=False,
            html_message=html_message,
        )

        return user


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match.")
        return data