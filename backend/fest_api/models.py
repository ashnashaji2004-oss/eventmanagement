import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.core.exceptions import ValidationError


class UserRole(models.TextChoices):
    ADMIN = 'ADMIN', 'Admin'
    TEACHER = 'TEACHER', 'Teacher'
    PARENT = 'PARENT', 'Parent'


class VerificationStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending Verification'
    APPROVED = 'APPROVED', 'Approved / Verified'
    REJECTED = 'REJECTED', 'Rejected'
    SUSPENDED = 'SUSPENDED', 'Suspended'


class SchoolSection(models.TextChoices):
    UP = 'UP', 'UP Section'
    HS = 'HS', 'High School Section'


class EventSection(models.TextChoices):
    ALL = 'ALL', 'All Sections'
    UP = 'UP', 'UP Section'
    HS = 'HS', 'High School Section'


class User(AbstractUser):
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.TEACHER
    )
    phone_number = models.CharField(max_length=20, blank=True)
    application_number = models.CharField(max_length=60, blank=True, null=True, unique=True)
    profile_photo = models.CharField(max_length=500, blank=True)
    is_verified = models.BooleanField(
        default=False,
        help_text="Designates whether this user has been approved/verified by an administrator."
    )
    verification_status = models.CharField(
        max_length=20,
        choices=VerificationStatus.choices,
        default=VerificationStatus.PENDING
    )
    rejection_reason = models.TextField(blank=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    verified_by = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='verified_accounts'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['id']

    def save(self, *args, **kwargs):
        # Admin accounts NEVER require verification to log in
        if self.role == UserRole.ADMIN or self.is_superuser or self.is_staff or (self.username and self.username.lower() == 'admin'):
            self.role = UserRole.ADMIN
            self.is_staff = True
            self.is_verified = True
            self.verification_status = VerificationStatus.APPROVED
            self.is_active = True
        super().save(*args, **kwargs)

    def is_admin_user(self):
        return self.role == UserRole.ADMIN or self.is_superuser

    def is_teacher_user(self):
        return self.role == UserRole.TEACHER

    def is_parent_user(self):
        return self.role == UserRole.PARENT


class TeacherProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='teacher_profile')
    employee_id = models.CharField(max_length=50, unique=True)
    department = models.CharField(max_length=100, blank=True)
    designation = models.CharField(max_length=100, default='Teacher')
    qualification = models.CharField(max_length=100, blank=True)
    can_create_events = models.BooleanField(default=True)
    can_generate_certificates = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} ({self.employee_id})"


class ParentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='parent_profile')
    occupation = models.CharField(max_length=100, blank=True)
    address = models.TextField(blank=True)
    alternate_phone = models.CharField(max_length=20, blank=True)
    requested_admission_number = models.CharField(max_length=50, blank=True)
    requested_relationship = models.CharField(max_length=50, blank=True, default='Parent')

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} (Parent)"


class HouseChoice(models.TextChoices):
    ORANGE = 'Orange', 'Orange House'
    BLUE = 'Blue', 'Blue House'
    YELLOW = 'Yellow', 'Yellow House'
    GREEN = 'Green', 'Green House'


class House(models.Model):
    name = models.CharField(max_length=20, choices=HouseChoice.choices, unique=True)
    slug = models.SlugField(max_length=20, unique=True)
    color_code = models.CharField(max_length=10) # e.g. #F97316
    secondary_color = models.CharField(max_length=10, blank=True)
    motto = models.CharField(max_length=255, blank=True)
    motto_ml = models.CharField(max_length=255, blank=True)
    captain_name = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return f"{self.name} House"

    def get_total_points(self, academic_year=None, section=None):
        qs = self.score_transactions.all()
        if academic_year:
            qs = qs.filter(academic_year=academic_year)
        if section:
            qs = qs.filter(
                models.Q(event__school_section=section) |
                models.Q(result__student__school_section=section)
            )
        total = qs.aggregate(models.Sum('points'))['points__sum']
        return total or 0

    def get_first_place_count(self, academic_year=None, section=None):
        qs = Result.objects.filter(
            position=ResultPosition.FIRST,
            is_published=True,
            approval_status=ApprovalStatus.APPROVED
        )
        if academic_year:
            qs = qs.filter(event__academic_year=academic_year)
        if section:
            qs = qs.filter(
                models.Q(event__school_section=section) |
                models.Q(student__school_section=section)
            )
        return qs.filter(
            models.Q(student__house=self) | models.Q(team__house=self)
        ).distinct().count()


class Student(models.Model):
    admission_number = models.CharField(max_length=50, unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100, blank=True)
    malayalam_name = models.CharField(max_length=150, blank=True)
    class_name = models.CharField(max_length=20) # e.g. "10", "11", "9"
    division = models.CharField(max_length=10)   # e.g. "A", "B", "C"
    school_section = models.CharField(
        max_length=10,
        choices=SchoolSection.choices,
        default=SchoolSection.HS
    )
    house = models.ForeignKey(House, on_delete=models.PROTECT, related_name='students')
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=20, choices=[('M', 'Male'), ('F', 'Female'), ('O', 'Other')], default='M')
    academic_year = models.CharField(max_length=20, default='2025-2026')
    profile_photo = models.CharField(max_length=500, blank=True)
    is_active = models.BooleanField(default=True)
    is_archived = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['class_name', 'division', 'admission_number']

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.class_name}-{self.division}, {self.house.name})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    def save(self, *args, **kwargs):
        # Auto-compute school_section: UP Section (Classes 5-7), High School (Classes 8-12)
        try:
            digits = ''.join(filter(str.isdigit, str(self.class_name)))
            c_num = int(digits) if digits else 10
            if 5 <= c_num <= 7:
                self.school_section = SchoolSection.UP
            elif 8 <= c_num <= 12:
                self.school_section = SchoolSection.HS
            else:
                self.school_section = SchoolSection.HS
        except Exception:
            if not self.school_section:
                self.school_section = SchoolSection.HS
        super().save(*args, **kwargs)


class ParentStudentRelationship(models.Model):
    parent = models.ForeignKey(ParentProfile, on_delete=models.CASCADE, related_name='child_relationships')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='parent_relationships')
    relationship_type = models.CharField(
        max_length=50,
        choices=[('Father', 'Father'), ('Mother', 'Mother'), ('Guardian', 'Guardian')],
        default='Father'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('parent', 'student')
        ordering = ['id']

    def __str__(self):
        return f"{self.parent} -> {self.student.full_name} ({self.relationship_type})"


class LinkRequestStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    APPROVED = 'APPROVED', 'Approved'
    REJECTED = 'REJECTED', 'Rejected'


class ParentChildLinkRequest(models.Model):
    parent = models.ForeignKey(ParentProfile, on_delete=models.CASCADE, related_name='child_requests')
    student_admission_number = models.CharField(max_length=50)
    student_name = models.CharField(max_length=150, blank=True)
    class_name = models.CharField(max_length=20, blank=True)
    division = models.CharField(max_length=10, blank=True)
    relationship_type = models.CharField(max_length=50, default='Parent')
    status = models.CharField(max_length=20, choices=LinkRequestStatus.choices, default=LinkRequestStatus.PENDING)
    rejection_reason = models.TextField(blank=True)
    matched_student = models.ForeignKey(Student, on_delete=models.SET_NULL, null=True, blank=True, related_name='link_requests')
    verified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_links')
    verified_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.parent} -> {self.student_admission_number} ({self.status})"


class EventCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    name_ml = models.CharField(max_length=150, blank=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, default='trophy')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Event Categories'
        ordering = ['id']

    def __str__(self):
        return self.name


class EventStatus(models.TextChoices):
    DRAFT = 'DRAFT', 'Draft'
    UPCOMING = 'UPCOMING', 'Upcoming'
    OPEN = 'OPEN', 'Open for Registration'
    CLOSED = 'CLOSED', 'Registration Closed'
    IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
    COMPLETED = 'COMPLETED', 'Completed'
    RESULTS_PENDING = 'RESULTS_PENDING', 'Results Pending Approval'
    RESULTS_PUBLISHED = 'RESULTS_PUBLISHED', 'Results Published'
    CANCELLED = 'CANCELLED', 'Cancelled'


class EventType(models.TextChoices):
    INDIVIDUAL = 'INDIVIDUAL', 'Individual'
    TEAM = 'TEAM', 'Team'


class Event(models.Model):
    name = models.CharField(max_length=200)
    name_ml = models.CharField(max_length=255, blank=True)
    category = models.ForeignKey(EventCategory, on_delete=models.PROTECT, related_name='events')
    description = models.TextField(blank=True)
    description_ml = models.TextField(blank=True)
    image_url = models.CharField(max_length=500, blank=True)
    event_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    venue = models.CharField(max_length=150)
    coordinating_teacher = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='coordinated_events'
    )
    participating_classes = models.CharField(max_length=200, default='All') # e.g. "8,9,10,11,12" or "All"
    school_section = models.CharField(
        max_length=10,
        choices=EventSection.choices,
        default=EventSection.ALL
    )
    event_type = models.CharField(max_length=20, choices=EventType.choices, default=EventType.INDIVIDUAL)
    max_participants = models.PositiveIntegerField(null=True, blank=True)
    registration_open_date = models.DateTimeField()
    registration_close_date = models.DateTimeField()
    is_registration_overridden = models.BooleanField(default=False)
    registration_override_reason = models.TextField(blank=True)
    overridden_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='deadline_overrides'
    )
    overridden_at = models.DateTimeField(null=True, blank=True)
    rules = models.TextField(blank=True)
    scoring_criteria = models.TextField(blank=True)
    status = models.CharField(max_length=30, choices=EventStatus.choices, default=EventStatus.OPEN)
    academic_year = models.CharField(max_length=20, default='2025-2026')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['event_date', 'start_time']

    def __str__(self):
        return f"{self.name} ({self.get_event_type_display()}) - {self.event_date}"

    def is_registration_currently_open(self):
        if self.status in [EventStatus.CANCELLED, EventStatus.COMPLETED]:
            return False
        if self.is_registration_overridden:
            return True
        now = timezone.now()
        if now < self.registration_open_date:
            return False
        if now > self.registration_close_date:
            return False
        return self.status in [EventStatus.OPEN, EventStatus.UPCOMING]


class Team(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='teams')
    name = models.CharField(max_length=150)
    house = models.ForeignKey(House, on_delete=models.PROTECT, related_name='teams')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return f"{self.name} ({self.house.name} - {self.event.name})"


class TeamMember(models.Model):
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='members')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='team_memberships')

    class Meta:
        unique_together = ('team', 'student')
        ordering = ['id']

    def __str__(self):
        return f"{self.student.full_name} in {self.team.name}"


class EventParticipant(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='participants')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='event_participations')
    team = models.ForeignKey(Team, on_delete=models.SET_NULL, null=True, blank=True, related_name='participant_records')
    chest_number = models.CharField(max_length=20, blank=True)
    registered_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    registered_at = models.DateTimeField(auto_now_add=True)
    attended = models.BooleanField(default=True)

    class Meta:
        unique_together = ('event', 'student')
        ordering = ['id']

    def __str__(self):
        return f"{self.student.full_name} - {self.event.name}"

    def clean(self):
        if not self.pk: # Only on creation
            if not self.event.is_registration_currently_open():
                raise ValidationError("Registration for this event is closed. The deadline has passed.")


class ResultPosition(models.TextChoices):
    FIRST = '1ST', 'First Place'
    SECOND = '2ND', 'Second Place'
    THIRD = '3RD', 'Third Place'
    PARTICIPATION = 'PARTICIPATION', 'Participation'
    NONE = 'NONE', 'None'


class ApprovalStatus(models.TextChoices):
    DRAFT = 'DRAFT', 'Draft'
    PENDING_APPROVAL = 'PENDING_APPROVAL', 'Pending Approval'
    APPROVED = 'APPROVED', 'Approved'
    REJECTED = 'REJECTED', 'Rejected'


class Result(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='results')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, null=True, blank=True, related_name='results')
    team = models.ForeignKey(Team, on_delete=models.CASCADE, null=True, blank=True, related_name='results')
    marks_obtained = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    max_marks = models.DecimalField(max_digits=6, decimal_places=2, default=100.00)
    position = models.CharField(max_length=20, choices=ResultPosition.choices, default=ResultPosition.NONE)
    award = models.CharField(max_length=100, blank=True) # e.g. "First Prize", "Gold Medal", "Grade A"
    award_ml = models.CharField(max_length=150, blank=True)
    grade = models.CharField(max_length=10, blank=True) # A+, A, B, etc.
    judge_comments = models.TextField(blank=True)
    approval_status = models.CharField(
        max_length=30, choices=ApprovalStatus.choices, default=ApprovalStatus.DRAFT
    )
    rejection_reason = models.TextField(blank=True)
    submitted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='submitted_results')
    submitted_at = models.DateTimeField(null=True, blank=True)
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_results')
    approved_at = models.DateTimeField(null=True, blank=True)
    is_published = models.BooleanField(default=False)
    certificate_eligible = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['position', '-marks_obtained']
        constraints = [
            models.UniqueConstraint(
                fields=['event', 'student'],
                condition=models.Q(student__isnull=False),
                name='unique_event_student_result'
            ),
            models.UniqueConstraint(
                fields=['event', 'team'],
                condition=models.Q(team__isnull=False),
                name='unique_event_team_result'
            )
        ]

    def __str__(self):
        target = self.student.full_name if self.student else (self.team.name if self.team else 'N/A')
        return f"{self.event.name}: {target} - {self.get_position_display()} ({self.approval_status})"

    def clean(self):
        super().clean()
        if not self.student and not self.team:
            raise ValidationError("Either a student or a team must be associated with this result.")
        if self.student and self.team:
            raise ValidationError("A result cannot be linked to both an individual student and a team simultaneously.")
        if self.marks_obtained is not None and self.marks_obtained < 0:
            raise ValidationError("Marks obtained cannot be negative.")
        if self.marks_obtained is not None and self.max_marks and self.marks_obtained > self.max_marks:
            raise ValidationError(f"Marks obtained ({self.marks_obtained}) cannot exceed maximum marks ({self.max_marks}).")

    def get_house(self):
        if self.student and self.student.house:
            return self.student.house
        if self.team and self.team.house:
            return self.team.house
        return None


class TransactionType(models.TextChoices):
    RESULT_POINTS = 'RESULT_POINTS', 'Result Award Points'
    MANUAL_CORRECTION = 'MANUAL_CORRECTION', 'Manual Correction'
    BONUS = 'BONUS', 'Bonus Points'
    PENALTY = 'PENALTY', 'Penalty'


class HouseScoreTransaction(models.Model):
    house = models.ForeignKey(House, on_delete=models.CASCADE, related_name='score_transactions')
    result = models.ForeignKey(Result, on_delete=models.CASCADE, null=True, blank=True, related_name='house_transactions')
    event = models.ForeignKey(Event, on_delete=models.SET_NULL, null=True, blank=True, related_name='score_transactions')
    points = models.IntegerField()
    reason = models.CharField(max_length=255)
    transaction_type = models.CharField(
        max_length=30, choices=TransactionType.choices, default=TransactionType.RESULT_POINTS
    )
    academic_year = models.CharField(max_length=20, default='2025-2026')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        # Prevent double crediting points for the same result to the same house
        constraints = [
            models.UniqueConstraint(
                fields=['house', 'result'],
                condition=models.Q(result__isnull=False),
                name='unique_result_house_transaction'
            )
        ]

    def __str__(self):
        return f"{self.house.name}: {'+' if self.points >= 0 else ''}{self.points} pts ({self.reason})"


class CertificateStatus(models.TextChoices):
    VALID = 'VALID', 'Valid'
    REVOKED = 'REVOKED', 'Revoked'


class Certificate(models.Model):
    certificate_number = models.CharField(max_length=60, unique=True)
    verification_token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='certificates')
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='certificates')
    result = models.ForeignKey(Result, on_delete=models.CASCADE, related_name='certificates')
    award_title = models.CharField(max_length=150)
    award_title_ml = models.CharField(max_length=200, blank=True)
    status = models.CharField(max_length=20, choices=CertificateStatus.choices, default=CertificateStatus.VALID)
    revocation_reason = models.TextField(blank=True)
    revoked_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='revoked_certificates')
    revoked_at = models.DateTimeField(null=True, blank=True)
    issued_at = models.DateTimeField(auto_now_add=True)
    academic_year = models.CharField(max_length=20, default='2025-2026')
    pdf_file = models.FileField(upload_to='certificates/', null=True, blank=True)

    class Meta:
        ordering = ['-issued_at']
        unique_together = ('student', 'result')

    def __str__(self):
        return f"Certificate {self.certificate_number} - {self.student.full_name} ({self.status})"


class AcademicYear(models.Model):
    name = models.CharField(max_length=20, unique=True) # e.g. "2025-2026"
    is_current = models.BooleanField(default=False)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-name']

    def __str__(self):
        return f"{self.name} {'(Current)' if self.is_current else ''}"


class SchoolSettings(models.Model):
    school_name = models.CharField(max_length=255, default="Chaldean Syrian Higher Secondary School")
    school_name_ml = models.CharField(max_length=255, default="ചാൽഡിയൻ സിറിയൻ ഹയർ സെക്കൻഡറി സ്കൂൾ")
    school_motto = models.CharField(max_length=255, default="The fear of the Lord is the beginning of wisdom")
    school_motto_ml = models.CharField(max_length=255, default="ഭയഭക്തി ജ്ഞാനത്തിന്റെ ആരംഭം")
    school_logo_url = models.CharField(max_length=500, default="/cshss-emblem.png")
    academic_year = models.CharField(max_length=20, default='2025-2026')
    timezone = models.CharField(max_length=50, default='Asia/Kolkata')
    points_1st = models.PositiveIntegerField(default=10)
    points_2nd = models.PositiveIntegerField(default=7)
    points_3rd = models.PositiveIntegerField(default=5)
    points_participation = models.PositiveIntegerField(default=1)
    default_language = models.CharField(max_length=10, default='en')
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.school_name


class AuditLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=100)
    target_model = models.CharField(max_length=100, blank=True)
    target_id = models.CharField(max_length=100, blank=True)
    details = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        actor = self.user.username if self.user else 'System'
        return f"[{self.timestamp.strftime('%Y-%m-%d %H:%M')}] {actor} - {self.action}"


class Notification(models.Model):
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications', null=True, blank=True)
    title = models.CharField(max_length=200)
    title_ml = models.CharField(max_length=255, blank=True)
    message = models.TextField()
    message_ml = models.TextField(blank=True)
    notification_type = models.CharField(
        max_length=50,
        choices=[
            ('EVENT_UPCOMING', 'Upcoming Event'),
            ('REGISTRATION_CLOSING', 'Registration Closing'),
            ('RESULT_PENDING', 'Result Pending Approval'),
            ('RESULT_PUBLISHED', 'Result Published'),
            ('CERTIFICATE_ISSUED', 'Certificate Issued'),
            ('REGISTRATION_REQUEST', 'New Registration Request'),
            ('LINK_REQUEST', 'Child Link Request'),
            ('ACCOUNT_STATUS_CHANGE', 'Account Status Changed'),
            ('SYSTEM', 'System Notification'),
        ],
        default='SYSTEM'
    )
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} to {self.recipient.username if self.recipient else 'All'}"
