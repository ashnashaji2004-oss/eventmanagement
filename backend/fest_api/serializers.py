from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import transaction
from .models import (
    UserRole, VerificationStatus, SchoolSection, EventSection, TeacherProfile, ParentProfile,
    House, Student, ParentStudentRelationship, ParentChildLinkRequest, EventCategory,
    Event, EventStatus, Team, TeamMember, EventParticipant, Result, HouseScoreTransaction,
    Certificate, SchoolSettings, AuditLog, Notification, AcademicYear
)

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'role',
            'phone_number', 'is_verified', 'verification_status', 'rejection_reason',
            'verified_at', 'is_active', 'date_joined'
        ]
        read_only_fields = ['date_joined', 'verified_at']


class TeacherProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role=UserRole.TEACHER), source='user', write_only=True, required=False
    )

    class Meta:
        model = TeacherProfile
        fields = [
            'id', 'user', 'user_id', 'employee_id', 'department',
            'designation', 'qualification', 'can_create_events', 'can_generate_certificates'
        ]


class HouseSerializer(serializers.ModelSerializer):
    total_points = serializers.SerializerMethodField()
    first_places = serializers.SerializerMethodField()
    student_count = serializers.SerializerMethodField()

    class Meta:
        model = House
        fields = [
            'id', 'name', 'slug', 'color_code', 'secondary_color',
            'motto', 'motto_ml', 'captain_name', 'total_points', 'first_places', 'student_count'
        ]

    def get_total_points(self, obj):
        academic_year = self.context.get('academic_year')
        return obj.get_total_points(academic_year)

    def get_first_places(self, obj):
        academic_year = self.context.get('academic_year')
        return obj.get_first_place_count(academic_year)

    def get_student_count(self, obj):
        return obj.students.filter(is_active=True).count()


class StudentSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    house_name = serializers.CharField(source='house.name', read_only=True)
    house_color = serializers.CharField(source='house.color_code', read_only=True)

    class Meta:
        model = Student
        fields = [
            'id', 'admission_number', 'first_name', 'last_name', 'full_name',
            'malayalam_name', 'class_name', 'division', 'school_section',
            'house', 'house_name', 'house_color', 'date_of_birth', 'gender',
            'academic_year', 'profile_photo', 'is_active', 'is_archived'
        ]


class ParentStudentRelationshipSerializer(serializers.ModelSerializer):
    student = StudentSerializer(read_only=True)
    student_id = serializers.PrimaryKeyRelatedField(
        queryset=Student.objects.all(), source='student', write_only=True
    )

    class Meta:
        model = ParentStudentRelationship
        fields = ['id', 'parent', 'student', 'student_id', 'relationship_type', 'created_at']


class ParentProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role=UserRole.PARENT), source='user', write_only=True, required=False
    )
    children = serializers.SerializerMethodField()

    class Meta:
        model = ParentProfile
        fields = [
            'id', 'user', 'user_id', 'occupation', 'address', 'alternate_phone',
            'requested_admission_number', 'requested_relationship', 'children'
        ]

    def get_children(self, obj):
        relationships = obj.child_relationships.select_related('student', 'student__house').all()
        return [
            {
                'relationship_id': r.id,
                'relationship_type': r.relationship_type,
                'student': StudentSerializer(r.student).data
            }
            for r in relationships
        ]


class EventCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = EventCategory
        fields = ['id', 'name', 'name_ml', 'description', 'icon', 'created_at']


class EventSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(queryset=EventCategory.objects.all(), required=False, allow_null=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_name_ml = serializers.CharField(source='category.name_ml', read_only=True)
    coordinating_teacher_name = serializers.SerializerMethodField()
    is_registration_open = serializers.SerializerMethodField()
    participants_count = serializers.SerializerMethodField()
    results_count = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            'id', 'name', 'name_ml', 'category', 'category_name', 'category_name_ml',
            'description', 'description_ml', 'image_url', 'event_date', 'start_time', 'end_time',
            'venue', 'coordinating_teacher', 'coordinating_teacher_name', 'participating_classes',
            'school_section', 'event_type', 'max_participants', 'registration_open_date', 'registration_close_date',
            'is_registration_overridden', 'registration_override_reason', 'overridden_by', 'overridden_at',
            'rules', 'scoring_criteria', 'status', 'academic_year', 'created_at', 'updated_at',
            'is_registration_open', 'participants_count', 'results_count'
        ]

    def get_coordinating_teacher_name(self, obj):
        if obj.coordinating_teacher:
            return obj.coordinating_teacher.get_full_name() or obj.coordinating_teacher.username
        return None

    def get_is_registration_open(self, obj):
        return obj.is_registration_currently_open()

    def get_participants_count(self, obj):
        return obj.participants.count()

    def get_results_count(self, obj):
        return obj.results.filter(is_published=True).count()


class TeamMemberSerializer(serializers.ModelSerializer):
    student = StudentSerializer(read_only=True)
    student_id = serializers.PrimaryKeyRelatedField(queryset=Student.objects.all(), source='student', write_only=True)

    class Meta:
        model = TeamMember
        fields = ['id', 'student', 'student_id']


class TeamSerializer(serializers.ModelSerializer):
    members = TeamMemberSerializer(many=True, read_only=True)
    house_name = serializers.CharField(source='house.name', read_only=True)
    house_color = serializers.CharField(source='house.color_code', read_only=True)

    class Meta:
        model = Team
        fields = ['id', 'event', 'name', 'house', 'house_name', 'house_color', 'members', 'created_at']


class EventParticipantSerializer(serializers.ModelSerializer):
    student_details = StudentSerializer(source='student', read_only=True)
    event_name = serializers.CharField(source='event.name', read_only=True)

    class Meta:
        model = EventParticipant
        fields = [
            'id', 'event', 'event_name', 'student', 'student_details',
            'team', 'chest_number', 'registered_by', 'registered_at', 'attended'
        ]
        read_only_fields = ['registered_at', 'registered_by']
        validators = [
            serializers.UniqueTogetherValidator(
                queryset=EventParticipant.objects.all(),
                fields=['event', 'student'],
                message="This student is already registered for this event."
            )
        ]

    def validate(self, attrs):
        event = attrs.get('event') or (self.instance.event if self.instance else None)
        student = attrs.get('student') or (self.instance.student if self.instance else None)
        request = self.context.get('request')
        is_admin = request and (request.user.role == UserRole.ADMIN or request.user.is_superuser)

        if not event or not student:
            return attrs

        # 1. Closed / Inactive events & deadline enforcement
        if event.status in [EventStatus.CANCELLED, EventStatus.COMPLETED]:
            raise serializers.ValidationError({
                "detail": f"Registration cannot be accepted for an event that is {event.get_status_display().lower()}."
            })

        if not event.is_registration_currently_open() and not is_admin:
            raise serializers.ValidationError({
                "detail": "Registration deadline has closed for this event. Late registrations are prohibited."
            })

        # 2. Student active status
        if not student.is_active or student.is_archived:
            raise serializers.ValidationError({
                "detail": "Cannot register an inactive or archived student."
            })

        # 3. School division compatibility (UP Section = Classes 5-7, HS = Classes 8-12)
        if event.school_section and event.school_section != EventSection.ALL:
            if student.school_section != event.school_section:
                raise serializers.ValidationError({
                    "detail": f"Student belongs to {student.get_school_section_display()} which is incompatible with this {event.get_school_section_display()} event."
                })

        # 4. Maximum participants limit
        if not self.instance and event.max_participants:
            current_count = event.participants.count()
            if current_count >= event.max_participants:
                raise serializers.ValidationError({
                    "detail": f"This event has reached its maximum capacity of {event.max_participants} participants."
                })

        # 5. Prevent duplicate registration
        existing = EventParticipant.objects.filter(event=event, student=student)
        if self.instance:
            existing = existing.exclude(pk=self.instance.pk)
        if existing.exists():
            raise serializers.ValidationError({
                "detail": f"Student '{student.full_name}' ({student.admission_number}) is already registered for this event."
            })

        return attrs


class ResultSerializer(serializers.ModelSerializer):
    student_details = StudentSerializer(source='student', read_only=True)
    student_name = serializers.SerializerMethodField()
    student_admission_number = serializers.CharField(source='student.admission_number', read_only=True)
    student_house_name = serializers.SerializerMethodField()
    team_house_name = serializers.CharField(source='team.house.name', read_only=True)
    position_display = serializers.CharField(source='get_position_display', read_only=True)
    event_name = serializers.CharField(source='event.name', read_only=True)
    event_category = serializers.CharField(source='event.category.name', read_only=True)
    team_name = serializers.CharField(source='team.name', read_only=True)
    house_details = serializers.SerializerMethodField()
    submitted_by_name = serializers.SerializerMethodField()
    approved_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Result
        fields = [
            'id', 'event', 'event_name', 'event_category', 'student', 'student_details',
            'student_name', 'student_admission_number', 'student_house_name', 'team_house_name',
            'team', 'team_name', 'house_details', 'marks_obtained', 'max_marks',
            'position', 'position_display', 'award', 'award_ml', 'grade', 'judge_comments',
            'approval_status', 'rejection_reason', 'submitted_by', 'submitted_by_name',
            'submitted_at', 'approved_by', 'approved_by_name', 'approved_at',
            'is_published', 'certificate_eligible', 'created_at', 'updated_at'
        ]
        read_only_fields = ['submitted_at', 'approved_at', 'created_at', 'updated_at']
        extra_kwargs = {
            'student': {'required': False, 'allow_null': True},
            'team': {'required': False, 'allow_null': True},
        }
        validators = []

    def get_student_name(self, obj):
        if obj.student:
            return obj.student.full_name
        if obj.team:
            return obj.team.name
        return None

    def get_student_house_name(self, obj):
        house = obj.get_house()
        return house.name if house else None

    def get_house_details(self, obj):
        house = obj.get_house()
        if house:
            return {
                'id': house.id,
                'name': house.name,
                'color_code': house.color_code
            }
        return None

    def get_submitted_by_name(self, obj):
        if obj.submitted_by:
            return obj.submitted_by.get_full_name() or obj.submitted_by.username
        return None

    def get_approved_by_name(self, obj):
        if obj.approved_by:
            return obj.approved_by.get_full_name() or obj.approved_by.username
        return None

    def validate(self, attrs):
        event = attrs.get('event') or (self.instance.event if self.instance else None)
        student = attrs.get('student') or (self.instance.student if self.instance else None)
        team = attrs.get('team') or (self.instance.team if self.instance else None)
        marks = attrs.get('marks_obtained')
        max_marks = attrs.get('max_marks') or (self.instance.max_marks if self.instance else 100.00)

        if not student and not team:
            raise serializers.ValidationError({
                "detail": "Either a student or a team must be selected for the result."
            })

        if marks is not None:
            if marks < 0:
                raise serializers.ValidationError({"marks_obtained": "Marks obtained cannot be negative."})
            if max_marks and marks > max_marks:
                raise serializers.ValidationError({"marks_obtained": f"Marks obtained ({marks}) cannot exceed maximum marks ({max_marks})."})

        # Prevent duplicate results for the same participant in the same event
        if student and event:
            dup_qs = Result.objects.filter(event=event, student=student)
            if self.instance:
                dup_qs = dup_qs.exclude(pk=self.instance.pk)
            if dup_qs.exists():
                raise serializers.ValidationError({
                    "detail": f"A result has already been recorded for student '{student.full_name}' in '{event.name}'."
                })

        if team and event:
            dup_qs = Result.objects.filter(event=event, team=team)
            if self.instance:
                dup_qs = dup_qs.exclude(pk=self.instance.pk)
            if dup_qs.exists():
                raise serializers.ValidationError({
                    "detail": f"A result has already been recorded for team '{team.name}' in '{event.name}'."
                })

        return attrs


class HouseScoreTransactionSerializer(serializers.ModelSerializer):
    house_name = serializers.CharField(source='house.name', read_only=True)
    house_color = serializers.CharField(source='house.color_code', read_only=True)
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = HouseScoreTransaction
        fields = [
            'id', 'house', 'house_name', 'house_color', 'result', 'event',
            'points', 'reason', 'transaction_type', 'academic_year',
            'created_by', 'created_by_name', 'created_at'
        ]
        read_only_fields = ['created_at']

    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.username
        return 'System'


class CertificateSerializer(serializers.ModelSerializer):
    student_details = StudentSerializer(source='student', read_only=True)
    event_name = serializers.CharField(source='event.name', read_only=True)
    event_name_ml = serializers.CharField(source='event.name_ml', read_only=True)
    verification_url = serializers.SerializerMethodField()

    class Meta:
        model = Certificate
        fields = [
            'id', 'certificate_number', 'verification_token', 'student', 'student_details',
            'event', 'event_name', 'event_name_ml', 'result', 'award_title', 'award_title_ml',
            'status', 'revocation_reason', 'revoked_at', 'issued_at', 'academic_year',
            'pdf_file', 'verification_url'
        ]
        extra_kwargs = {
            'certificate_number': {'required': False},
            'result': {'required': False, 'allow_null': True},
        }

    def get_verification_url(self, obj):
        request = self.context.get('request')
        base = request.build_absolute_uri('/')[:-1] if request else ''
        return f"{base}/verify-certificate/{obj.verification_token}"


class PublicCertificateVerificationSerializer(serializers.ModelSerializer):
    """
    Safe public serializer: strictly exposes minimal authenticity information.
    Never exposes admission number, parent info, private records.
    """
    recipient_name = serializers.CharField(source='student.full_name', read_only=True)
    malayalam_name = serializers.CharField(source='student.malayalam_name', read_only=True)
    event_name = serializers.CharField(source='event.name', read_only=True)
    event_name_ml = serializers.CharField(source='event.name_ml', read_only=True)
    house_name = serializers.CharField(source='student.house.name', read_only=True)
    house_color = serializers.CharField(source='student.house.color_code', read_only=True)

    class Meta:
        model = Certificate
        fields = [
            'certificate_number', 'verification_token', 'status', 'recipient_name',
            'malayalam_name', 'event_name', 'event_name_ml', 'award_title', 'award_title_ml',
            'academic_year', 'issued_at', 'house_name', 'house_color'
        ]


class SchoolSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchoolSettings
        fields = '__all__'


class AuditLogSerializer(serializers.ModelSerializer):
    actor_username = serializers.CharField(source='user.username', read_only=True)
    actor_role = serializers.CharField(source='user.role', read_only=True)

    class Meta:
        model = AuditLog
        fields = ['id', 'user', 'actor_username', 'actor_role', 'action', 'target_model', 'target_id', 'details', 'ip_address', 'timestamp']


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'recipient', 'title', 'title_ml', 'message', 'message_ml', 'notification_type', 'is_read', 'created_at']


class AcademicYearSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicYear
        fields = ['id', 'name', 'is_current', 'start_date', 'end_date', 'created_at']


class ParentChildLinkRequestSerializer(serializers.ModelSerializer):
    parent_username = serializers.CharField(source='parent.user.username', read_only=True)
    parent_name = serializers.SerializerMethodField()
    parent_phone = serializers.CharField(source='parent.user.phone_number', read_only=True)
    parent_email = serializers.CharField(source='parent.user.email', read_only=True)
    verified_by_name = serializers.CharField(source='verified_by.username', read_only=True)
    matched_student_name = serializers.CharField(source='matched_student.full_name', read_only=True)
    matched_student_class = serializers.CharField(source='matched_student.class_name', read_only=True)
    matched_student_division = serializers.CharField(source='matched_student.division', read_only=True)
    matched_student_house = serializers.CharField(source='matched_student.house.name', read_only=True)

    class Meta:
        model = ParentChildLinkRequest
        fields = [
            'id', 'parent', 'parent_username', 'parent_name', 'parent_phone', 'parent_email',
            'student_admission_number', 'student_name', 'class_name', 'division',
            'relationship_type', 'status', 'rejection_reason', 'matched_student',
            'matched_student_name', 'matched_student_class', 'matched_student_division',
            'matched_student_house', 'verified_by', 'verified_by_name', 'verified_at', 'created_at'
        ]

    def get_parent_name(self, obj):
        return obj.parent.user.get_full_name() or obj.parent.user.username


class AdminUserDetailSerializer(serializers.ModelSerializer):
    teacher_profile = TeacherProfileSerializer(read_only=True)
    parent_profile = ParentProfileSerializer(read_only=True)
    verified_by_username = serializers.CharField(source='verified_by.username', read_only=True)
    child_requests = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'role',
            'phone_number', 'application_number', 'profile_photo',
            'is_verified', 'verification_status', 'rejection_reason',
            'verified_at', 'verified_by', 'verified_by_username', 'is_active',
            'date_joined', 'teacher_profile', 'parent_profile', 'child_requests'
        ]

    def get_child_requests(self, obj):
        if obj.role == UserRole.PARENT and hasattr(obj, 'parent_profile'):
            return ParentChildLinkRequestSerializer(obj.parent_profile.child_requests.all(), many=True).data
        return []


class TeacherRegistrationSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=200)
    employee_id = serializers.CharField(max_length=50)
    email = serializers.EmailField()
    phone_number = serializers.CharField(max_length=20)
    department = serializers.CharField(max_length=100)
    designation = serializers.CharField(max_length=100, default='Teacher')
    password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True, min_length=6)

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        if User.objects.filter(email__iexact=attrs['email'].strip()).exists():
            raise serializers.ValidationError({'email': 'An account with this email already exists.'})
        if TeacherProfile.objects.filter(employee_id__iexact=attrs['employee_id'].strip()).exists():
            raise serializers.ValidationError({'employee_id': 'A teacher with this Employee ID is already registered.'})
        return attrs


class ChildLinkInputSerializer(serializers.Serializer):
    admission_number = serializers.CharField(max_length=50)
    student_name = serializers.CharField(max_length=150)
    class_name = serializers.CharField(max_length=20)
    division = serializers.CharField(max_length=10)
    relationship_type = serializers.CharField(max_length=50, default='Parent')


class ParentRegistrationSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=200)
    email = serializers.EmailField()
    phone_number = serializers.CharField(max_length=20)
    relationship = serializers.CharField(max_length=50, default='Parent')
    password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True, min_length=6)
    children = ChildLinkInputSerializer(many=True, required=True)

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        if User.objects.filter(email__iexact=attrs['email'].strip()).exists():
            raise serializers.ValidationError({'email': 'An account with this email already exists.'})
        if not attrs.get('children') or len(attrs['children']) == 0:
            raise serializers.ValidationError({'children': 'At least one student details must be provided.'})
        return attrs


class UserRegistrationSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True, default='')
    phone_number = serializers.CharField(max_length=20, required=False, allow_blank=True, default='')
    role = serializers.ChoiceField(choices=[('TEACHER', 'Teacher'), ('PARENT', 'Parent')])

    # Teacher fields
    employee_id = serializers.CharField(max_length=50, required=False, allow_blank=True, default='')
    department = serializers.CharField(max_length=100, required=False, allow_blank=True, default='')
    designation = serializers.CharField(max_length=100, required=False, allow_blank=True, default='Teacher')
    qualification = serializers.CharField(max_length=100, required=False, allow_blank=True, default='')

    # Parent fields
    occupation = serializers.CharField(max_length=100, required=False, allow_blank=True, default='')
    address = serializers.CharField(required=False, allow_blank=True, default='')
    alternate_phone = serializers.CharField(max_length=20, required=False, allow_blank=True, default='')
    requested_admission_number = serializers.CharField(max_length=50, required=False, allow_blank=True, default='')
    requested_relationship = serializers.CharField(max_length=50, required=False, allow_blank=True, default='Parent')

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email address already exists.")
        return value

    def validate(self, attrs):
        role = attrs.get('role')
        if role == 'TEACHER':
            emp_id = attrs.get('employee_id', '').strip()
            if not emp_id:
                raise serializers.ValidationError({'employee_id': 'Teacher Employee ID is required for verification.'})
            if TeacherProfile.objects.filter(employee_id__iexact=emp_id).exists():
                raise serializers.ValidationError({'employee_id': 'A teacher with this Employee ID is already registered.'})
        return attrs

    def create(self, validated_data):
        with transaction.atomic():
            role = validated_data['role']
            user = User.objects.create_user(
                username=validated_data['username'],
                email=validated_data['email'],
                password=validated_data['password'],
                first_name=validated_data.get('first_name', ''),
                last_name=validated_data.get('last_name', ''),
                phone_number=validated_data.get('phone_number', ''),
                role=role,
                is_verified=False,
                verification_status=VerificationStatus.PENDING
            )
            if role == 'TEACHER':
                TeacherProfile.objects.create(
                    user=user,
                    employee_id=validated_data.get('employee_id', f"TCH-{user.id:04d}"),
                    department=validated_data.get('department', ''),
                    designation=validated_data.get('designation', 'Teacher'),
                    qualification=validated_data.get('qualification', '')
                )
            elif role == 'PARENT':
                ParentProfile.objects.create(
                    user=user,
                    occupation=validated_data.get('occupation', ''),
                    address=validated_data.get('address', ''),
                    alternate_phone=validated_data.get('alternate_phone', ''),
                    requested_admission_number=validated_data.get('requested_admission_number', ''),
                    requested_relationship=validated_data.get('requested_relationship', 'Parent')
                )
            return user
