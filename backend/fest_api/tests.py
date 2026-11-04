from datetime import timedelta
from django.test import TestCase
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from .models import (
    UserRole, VerificationStatus, TeacherProfile, ParentProfile, House, Student,
    ParentStudentRelationship, EventCategory, Event, EventStatus, EventType,
    EventParticipant, Result, ResultPosition, ApprovalStatus,
    HouseScoreTransaction, TransactionType, Certificate, CertificateStatus,
    SchoolSettings, AuditLog
)

User = get_user_model()


class SchoolFestBackendTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Settings
        self.settings = SchoolSettings.objects.create(
            school_name="Chaldean Syrian Higher Secondary School",
            school_name_ml="ചാൽഡിയൻ സിറിയൻ ഹയർ സെക്കൻഡറി സ്കൂൾ",
            points_1st=10, points_2nd=7, points_3rd=5, points_participation=1
        )

        # 4 Official Houses: Orange, Blue, Yellow, Green
        self.house_orange = House.objects.create(name='Orange', slug='orange', color_code='#F97316')
        self.house_blue = House.objects.create(name='Blue', slug='blue', color_code='#3B82F6')
        self.house_yellow = House.objects.create(name='Yellow', slug='yellow', color_code='#F59E0B')
        self.house_green = House.objects.create(name='Green', slug='green', color_code='#10B981')

        # Verified Teacher user
        self.teacher_user = User.objects.create_user(
            username='teacher_test', password='TeacherPassword123', role=UserRole.TEACHER,
            is_verified=True, verification_status=VerificationStatus.APPROVED, is_active=True
        )
        self.teacher_profile = TeacherProfile.objects.create(
            user=self.teacher_user, employee_id='TCH-9999'
        )

        # Unverified Teacher user (Pending)
        self.unverified_teacher = User.objects.create_user(
            username='unverified_teacher', password='TeacherPassword123', role=UserRole.TEACHER,
            is_verified=False, verification_status=VerificationStatus.PENDING, is_active=False
        )

        # Verified Parent user 1 & 2
        self.parent_user1 = User.objects.create_user(
            username='parent1_test', password='ParentPassword123', role=UserRole.PARENT,
            is_verified=True, verification_status=VerificationStatus.APPROVED, is_active=True
        )
        self.parent_profile1 = ParentProfile.objects.create(user=self.parent_user1)

        self.parent_user2 = User.objects.create_user(
            username='parent2_test', password='ParentPassword123', role=UserRole.PARENT,
            is_verified=True, verification_status=VerificationStatus.APPROVED, is_active=True
        )
        self.parent_profile2 = ParentProfile.objects.create(user=self.parent_user2)

        # Students
        self.student1 = Student.objects.create(
            admission_number='TEST-001', first_name='Arjun', last_name='Nair',
            class_name='10', division='A', school_section='HS', house=self.house_orange
        )
        self.student2 = Student.objects.create(
            admission_number='TEST-002', first_name='Devika', last_name='Suresh',
            class_name='10', division='B', school_section='HS', house=self.house_blue
        )

        # Parent 1 linked ONLY to Student 1
        ParentStudentRelationship.objects.create(
            parent=self.parent_profile1, student=self.student1, relationship_type='Mother'
        )
        # Parent 2 linked ONLY to Student 2
        ParentStudentRelationship.objects.create(
            parent=self.parent_profile2, student=self.student2, relationship_type='Father'
        )

        # Category
        self.category = EventCategory.objects.create(name='Sports')

        # Events: One OPEN, One CLOSED
        now = timezone.now()
        self.open_event = Event.objects.create(
            name='Open High Jump',
            category=self.category,
            event_date=now.date() + timedelta(days=2),
            start_time='10:00:00', end_time='12:00:00',
            venue='Ground',
            registration_open_date=now - timedelta(days=1),
            registration_close_date=now + timedelta(days=1), # Open
            status=EventStatus.OPEN,
            school_section='HS'
        )

        self.closed_event = Event.objects.create(
            name='Closed Long Jump',
            category=self.category,
            event_date=now.date() + timedelta(days=2),
            start_time='10:00:00', end_time='12:00:00',
            venue='Pit',
            registration_open_date=now - timedelta(days=5),
            registration_close_date=now - timedelta(days=1), # Closed!
            status=EventStatus.CLOSED,
            school_section='HS'
        )

    def test_unverified_accounts_rejected_from_protected_endpoints(self):
        """Unverified teacher and parent cannot access protected endpoints."""
        self.client.force_authenticate(user=self.unverified_teacher)
        res = self.client.get('/api/students/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        # Unverified teacher cannot override deadlines
        res = self.client.post(f'/api/events/{self.closed_event.id}/override-deadline/', {'reason': 'test'})
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_teacher_and_parent_role_permissions(self):
        """Teacher can access student management; Parent cannot."""
        # Unauthenticated
        res = self.client.get('/api/students/')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

        # Parent user
        self.client.force_authenticate(user=self.parent_user1)
        res = self.client.get('/api/students/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        # Verified Teacher user
        self.client.force_authenticate(user=self.teacher_user)
        res = self.client.get('/api/students/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_parent_restricted_to_linked_children(self):
        """Parent 1 can view Student 1's achievements, but gets 403 for Student 2."""
        self.client.force_authenticate(user=self.parent_user1)

        # Linked child
        res = self.client.get(f'/api/parent/child-achievements/{self.student1.id}/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['student']['admission_number'], 'TEST-001')

        # Unlinked child (Student 2 belongs to Parent 2)
        res = self.client.get(f'/api/parent/child-achievements/{self.student2.id}/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_backend_deadline_enforcement(self):
        """Registration after deadline fails at backend for teacher."""
        self.client.force_authenticate(user=self.teacher_user)

        # Open event registration succeeds
        res_open = self.client.post('/api/participants/', {
            'event': self.open_event.id,
            'student': self.student1.id
        })
        self.assertEqual(res_open.status_code, status.HTTP_201_CREATED)

        # Closed event registration rejected by backend
        res_closed = self.client.post('/api/participants/', {
            'event': self.closed_event.id,
            'student': self.student2.id
        })
        self.assertEqual(res_closed.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Registration deadline has closed", str(res_closed.data))

    def test_teacher_deadline_override(self):
        """Teacher can override closed registration deadline with audit log."""
        self.client.force_authenticate(user=self.teacher_user)

        res = self.client.post(f'/api/events/{self.closed_event.id}/override-deadline/', {
            'reason': 'Special extension authorized for inter-house track competition'
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.closed_event.refresh_from_db()
        self.assertTrue(self.closed_event.is_registration_overridden)

        # Audit log was created
        log_entry = AuditLog.objects.filter(action='OVERRIDE_REGISTRATION_DEADLINE', target_id=str(self.closed_event.id)).first()
        self.assertIsNotNone(log_entry)
        self.assertIn("Special extension authorized", log_entry.details)

        # Now registration succeeds because override is active
        res_after = self.client.post('/api/participants/', {
            'event': self.closed_event.id,
            'student': self.student2.id
        })
        self.assertEqual(res_after.status_code, status.HTTP_201_CREATED)

    def test_division_compatibility_and_duplicate_prevention(self):
        """Backend enforces division compatibility and prevents duplicate registrations and results."""
        self.client.force_authenticate(user=self.teacher_user)

        # Create UP Student
        up_student = Student.objects.create(
            admission_number='UP-DIV-001', first_name='Meera', last_name='Menon',
            class_name='6', division='A', school_section='UP', house=self.house_green
        )

        # 1. UP Student trying to register for HS Event (self.open_event has school_section='HS')
        res_incompatible = self.client.post('/api/participants/', {
            'event': self.open_event.id,
            'student': up_student.id
        })
        self.assertEqual(res_incompatible.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("incompatible", str(res_incompatible.data).lower())

        # 2. Register valid student
        res_reg = self.client.post('/api/participants/', {
            'event': self.open_event.id,
            'student': self.student1.id
        })
        self.assertEqual(res_reg.status_code, status.HTTP_201_CREATED)

        # 3. Duplicate registration is rejected
        res_dup_reg = self.client.post('/api/participants/', {
            'event': self.open_event.id,
            'student': self.student1.id
        })
        self.assertEqual(res_dup_reg.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("already registered", str(res_dup_reg.data).lower())

        # 4. Record result
        res_res1 = self.client.post('/api/results/', {
            'event': self.open_event.id,
            'student': self.student1.id,
            'marks_obtained': '90.00',
            'position': '1ST',
            'award': 'First Prize'
        })
        self.assertEqual(res_res1.status_code, status.HTTP_201_CREATED)

        # 5. Duplicate result is rejected
        res_dup_res = self.client.post('/api/results/', {
            'event': self.open_event.id,
            'student': self.student1.id,
            'marks_obtained': '85.00',
            'position': '2ND',
            'award': 'Second Prize'
        })
        self.assertEqual(res_dup_res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("already been recorded", str(res_dup_res.data).lower())

    def test_house_score_calculation_and_duplicate_prevention(self):
        """Teacher result creation credits points and issues certificate; duplicate does not double-credit."""
        initial_points = self.house_orange.get_total_points()

        self.client.force_authenticate(user=self.teacher_user)
        res = self.client.post('/api/results/', {
            'event': self.open_event.id,
            'student': self.student1.id,
            'marks_obtained': '95.00',
            'position': '1ST',
            'award': '1st Place Gold Medal',
            'certificate_eligible': True
        })
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        # House points credited
        self.assertEqual(self.house_orange.get_total_points(), initial_points + 10)

        # Certificate was automatically generated
        cert = Certificate.objects.filter(student=self.student1, event=self.open_event).first()
        self.assertIsNotNone(cert)
        self.assertEqual(cert.status, CertificateStatus.VALID)

    def test_qr_certificate_public_verification_and_revocation(self):
        """Public verification endpoint returns VALID, then REVOKED after revocation."""
        result = Result.objects.create(
            event=self.open_event,
            student=self.student1,
            position=ResultPosition.FIRST,
            award='First Prize',
            approval_status=ApprovalStatus.APPROVED,
            is_published=True
        )
        cert = Certificate.objects.create(
            certificate_number='SF-TEST-0001',
            student=self.student1,
            event=self.open_event,
            result=result,
            award_title='First Prize'
        )

        # Public verification without login
        self.client.logout()
        res_verify = self.client.get(f'/api/certificates/verify/{cert.verification_token}/')
        self.assertEqual(res_verify.status_code, status.HTTP_200_OK)
        self.assertEqual(res_verify.data['status'], 'VALID')
        self.assertEqual(res_verify.data['recipient_name'], 'Arjun Nair')
        self.assertEqual(res_verify.data['school_name'], 'Chaldean Syrian Higher Secondary School')
        self.assertNotIn('admission_number', res_verify.data)

        # Revoke by Teacher
        self.client.force_authenticate(user=self.teacher_user)
        res_revoke = self.client.post(f'/api/certificates/{cert.id}/revoke/', {
            'reason': 'Disqualified due to eligibility issue'
        })
        self.assertEqual(res_revoke.status_code, status.HTTP_200_OK)

        # Public verify now shows REVOKED
        self.client.logout()
        res_verify2 = self.client.get(f'/api/certificates/verify/{cert.verification_token}/')
        self.assertEqual(res_verify2.status_code, status.HTTP_200_OK)
        self.assertEqual(res_verify2.data['status'], 'REVOKED')
        self.assertEqual(res_verify2.data['revocation_reason'], 'Disqualified due to eligibility issue')

    def test_teacher_registration_and_admin_approval(self):
        """Teacher registers with PENDING status, cannot login until Admin approves."""
        self.client.logout()
        res = self.client.post('/api/auth/register/teacher/', {
            'full_name': 'Anil Kumar',
            'employee_id': 'TCH-TEST-888',
            'email': 'anil.kumar@cshss.edu',
            'phone_number': '9876543210',
            'department': 'Mathematics',
            'designation': 'Senior Teacher',
            'password': 'ComplexPassword123!',
            'confirm_password': 'ComplexPassword123!'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        app_no = res.data['application_number']
        self.assertTrue(app_no.startswith('APP-TCH-'))

        new_teacher = User.objects.get(email='anil.kumar@cshss.edu')
        self.assertEqual(new_teacher.verification_status, 'PENDING')
        self.assertFalse(new_teacher.is_active)

        # Admin approves the registration
        admin_user = User.objects.create_superuser(
            username='admin_test_root', password='AdminPass123', email='root@cshss.edu'
        )
        self.client.force_authenticate(user=admin_user)
        res_approve = self.client.post(f'/api/admin/users/{new_teacher.id}/verify/', {
            'action': 'APPROVE'
        }, format='json')
        self.assertEqual(res_approve.status_code, status.HTTP_200_OK)

        new_teacher.refresh_from_db()
        self.assertEqual(new_teacher.verification_status, 'APPROVED')
        self.assertTrue(new_teacher.is_active)

    def test_parent_registration_with_multi_child_links(self):
        """Parent registers with multiple children; links require Admin approval."""
        self.client.logout()
        res = self.client.post('/api/auth/register/parent/', {
            'full_name': 'Ramesh Menon',
            'email': 'ramesh.menon@example.com',
            'phone_number': '9847123456',
            'relationship': 'Father',
            'password': 'ParentPassword123!',
            'confirm_password': 'ParentPassword123!',
            'children': [
                {
                    'admission_number': 'TEST-001',
                    'student_name': 'Arjun Nair',
                    'class_name': '10',
                    'division': 'A',
                    'relationship_type': 'Father'
                }
            ]
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        app_no = res.data['application_number']
        self.assertTrue(app_no.startswith('APP-PAR-'))

        from .models import ParentChildLinkRequest
        link_req = ParentChildLinkRequest.objects.filter(student_admission_number='TEST-001').first()
        self.assertIsNotNone(link_req)
        self.assertEqual(link_req.status, 'PENDING')

        # Admin approves the link request
        admin_user = User.objects.filter(username='admin_test_root').first()
        if not admin_user:
            admin_user = User.objects.create_superuser(
                username='admin_test_root2', password='AdminPass123', email='root2@cshss.edu'
            )
        self.client.force_authenticate(user=admin_user)
        res_approve = self.client.post(f'/api/admin/child-link-requests/{link_req.id}/approve_link/')
        self.assertEqual(res_approve.status_code, status.HTTP_200_OK)

        link_req.refresh_from_db()
        self.assertEqual(link_req.status, 'APPROVED')

    def test_section_scoring_separation_and_pdf_download(self):
        """UP vs HS scoring separation and ReportLab PDF download."""
        # Create UP Student and HS Student
        up_student = Student.objects.create(
            admission_number='UP-001', first_name='Sanjay', last_name='Varma',
            class_name='6', division='A', school_section='UP', house=self.house_orange
        )
        hs_student = Student.objects.create(
            admission_number='HS-001', first_name='Kavya', last_name='Pillai',
            class_name='11', division='B', school_section='HS', house=self.house_blue
        )

        now = timezone.now()
        up_event = Event.objects.create(
            name='UP Pencil Drawing',
            category=self.category,
            event_date=now.date() + timedelta(days=2),
            start_time='10:00:00', end_time='12:00:00',
            venue='Art Room',
            registration_open_date=now - timedelta(days=1),
            registration_close_date=now + timedelta(days=1),
            status=EventStatus.OPEN,
            school_section='UP'
        )

        self.client.force_authenticate(user=self.teacher_user)
        res_result = self.client.post('/api/results/', {
            'event': up_event.id,
            'student': up_student.id,
            'position': ResultPosition.FIRST,
            'award': 'UP 1st Prize Winner',
            'certificate_eligible': True
        })
        self.assertEqual(res_result.status_code, status.HTTP_201_CREATED)

        # Check UP score vs Overall score
        up_orange_pts = self.house_orange.get_total_points(section='UP')
        self.assertEqual(up_orange_pts, 10)
        hs_orange_pts = self.house_orange.get_total_points(section='HS')
        self.assertEqual(hs_orange_pts, 0)

        # Check PDF download
        cert = Certificate.objects.filter(student=up_student).first()
        self.assertIsNotNone(cert)
        pdf_res = self.client.get(f'/api/certificates/{cert.id}/download-pdf/')
        self.assertEqual(pdf_res.status_code, status.HTTP_200_OK)
        self.assertEqual(pdf_res['Content-Type'], 'application/pdf')
        self.assertTrue(pdf_res.content.startswith(b'%PDF'))
