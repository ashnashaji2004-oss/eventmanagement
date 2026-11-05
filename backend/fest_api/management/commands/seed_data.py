import uuid
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model
from fest_api.models import (
    UserRole, VerificationStatus, TeacherProfile, ParentProfile, House, Student,
    ParentStudentRelationship, EventCategory, Event, EventStatus, EventType,
    EventParticipant, Result, ResultPosition, ApprovalStatus,
    HouseScoreTransaction, TransactionType, Certificate, CertificateStatus,
    SchoolSettings
)

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed comprehensive initial sample data for SchoolFest'

    def handle(self, *args, **options):
        self.stdout.write("Starting SchoolFest data seeding...")

        # 1. School Settings
        settings_obj, _ = SchoolSettings.objects.get_or_create(
            id=1,
            defaults={
                'school_name': "Chaldean Syrian Higher Secondary School",
                'school_name_ml': "ചാൽഡിയൻ സിറിയൻ ഹയർ സെക്കൻഡറി സ്കൂൾ",
                'school_motto': "The fear of the Lord is the beginning of wisdom",
                'school_motto_ml': "ഭയഭക്തി ജ്ഞാനത്തിന്റെ ആരംഭം",
                'school_logo_url': "/cshss-emblem.png",
                'academic_year': "2025-2026",
                'timezone': "Asia/Kolkata",
                'points_1st': 10,
                'points_2nd': 7,
                'points_3rd': 5,
                'points_participation': 1,
                'default_language': 'en'
            }
        )
        settings_obj.school_name = "Chaldean Syrian Higher Secondary School"
        settings_obj.school_name_ml = "ചാൽഡിയൻ സിറിയൻ ഹയർ സെക്കൻഡറി സ്കൂൾ"
        settings_obj.school_motto = "The fear of the Lord is the beginning of wisdom"
        settings_obj.school_motto_ml = "ഭയഭക്തി ജ്ഞാനത്തിന്റെ ആരംഭം"
        settings_obj.school_logo_url = "/cshss-emblem.png"
        settings_obj.save()
        self.stdout.write(f"Configured School: {settings_obj.school_name}")

        # 1.1 Academic Years
        from fest_api.models import AcademicYear, ParentChildLinkRequest
        AcademicYear.objects.get_or_create(name='2024-2025', defaults={'is_current': False})
        AcademicYear.objects.get_or_create(name='2025-2026', defaults={'is_current': True})
        AcademicYear.objects.get_or_create(name='2026-2027', defaults={'is_current': False})

        # 2. Four Houses
        house_data = [
            {
                'name': 'Orange',
                'slug': 'orange',
                'color_code': '#F97316',
                'secondary_color': '#FFEDD5',
                'motto': 'Courage, Valor & Honor',
                'motto_ml': 'ധൈര്യവും ബഹുമാനവും',
                'captain_name': 'Rohan Mathew'
            },
            {
                'name': 'Blue',
                'slug': 'blue',
                'color_code': '#3B82F6',
                'secondary_color': '#DBEAFE',
                'motto': 'Wisdom, Integrity & Truth',
                'motto_ml': 'ജ്ഞാനവും സത്യസന്ധതയും',
                'captain_name': 'Aarav Krishna'
            },
            {
                'name': 'Yellow',
                'slug': 'yellow',
                'color_code': '#F59E0B',
                'secondary_color': '#FEF3C7',
                'motto': 'Perseverance, Radiance & Glory',
                'motto_ml': 'സ്ഥിരോത്സാഹവും പ്രഭാവവും',
                'captain_name': 'Meera Nambiar'
            },
            {
                'name': 'Green',
                'slug': 'green',
                'color_code': '#10B981',
                'secondary_color': '#D1FAE5',
                'motto': 'Growth, Unity & Harmony',
                'motto_ml': 'വളർച്ചയും ഐക്യവും',
                'captain_name': 'Gautam Menon'
            }
        ]

        houses = {}
        for h in house_data:
            house_obj, created = House.objects.get_or_create(
                slug=h['slug'],
                defaults=h
            )
            houses[h['name']] = house_obj
            houses[h['name'].lower()] = house_obj
            houses[h['name'].title()] = house_obj
            houses[h['slug']] = house_obj
        self.stdout.write("Created/Verified 4 Houses: Orange, Blue, Yellow, Green")

        # 3. Users: Admin, Teachers, Parents (Strictly NO student login)
        # Admin
        admin_default, _ = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@schoolfest.cshss.edu',
                'first_name': 'Administrator',
                'last_name': 'CSHSS',
                'role': UserRole.ADMIN,
                'is_staff': True,
                'is_superuser': True,
                'is_verified': True,
                'verification_status': VerificationStatus.APPROVED,
                'verified_at': timezone.now(),
                'phone_number': '+91 98470 00000'
            }
        )
        admin_default.is_verified = True
        admin_default.verification_status = VerificationStatus.APPROVED
        admin_default.verified_at = timezone.now()
        admin_default.is_staff = True
        admin_default.is_superuser = True
        admin_default.set_password('Admin@123')
        admin_default.save()

        # Admin Binu k p
        for uname in ['binu', 'Binu']:
            admin_u, _ = User.objects.get_or_create(
                username=uname,
                defaults={
                    'email': f'{uname.lower()}@schoolfest.edu',
                    'first_name': 'Binu',
                    'last_name': 'K P',
                    'role': UserRole.ADMIN,
                    'is_staff': True,
                    'is_superuser': True,
                    'is_verified': True,
                    'verification_status': VerificationStatus.APPROVED,
                    'verified_at': timezone.now(),
                    'phone_number': '+91 98470 12345'
                }
            )
            admin_u.first_name = 'Binu'
            admin_u.last_name = 'K P'
            admin_u.role = UserRole.ADMIN
            admin_u.is_staff = True
            admin_u.is_superuser = True
            admin_u.is_verified = True
            admin_u.verification_status = VerificationStatus.APPROVED
            admin_u.set_password('Binu@123')
            admin_u.save()
        admin_user = User.objects.get(username='binu')

        # Teachers (Approved)
        teacher1, _ = User.objects.get_or_create(
            username='teacher_anita',
            defaults={
                'email': 'anita.george@schoolfest.edu',
                'first_name': 'Anita',
                'last_name': 'George',
                'role': UserRole.TEACHER,
                'is_verified': True,
                'verification_status': VerificationStatus.APPROVED,
                'verified_by': admin_user,
                'verified_at': timezone.now(),
                'phone_number': '+91 98471 23456'
            }
        )
        teacher1.is_verified = True
        teacher1.verification_status = VerificationStatus.APPROVED
        teacher1.verified_by = admin_user
        teacher1.set_password('Teacher@123')
        teacher1.save()
        TeacherProfile.objects.get_or_create(
            user=teacher1,
            defaults={
                'employee_id': 'TCH-0101',
                'department': 'Physical Education & Arts',
                'designation': 'Senior Cultural Coordinator',
                'can_create_events': True,
                'can_generate_certificates': True
            }
        )

        # Demo Verified Teacher Account (username: teacher / password: Teacher@123)
        teacher_demo, _ = User.objects.get_or_create(
            username='teacher',
            defaults={
                'email': 'teacher@schoolfest.edu',
                'first_name': 'Anita',
                'last_name': 'George',
                'role': UserRole.TEACHER,
                'is_verified': True,
                'verification_status': VerificationStatus.APPROVED,
                'verified_by': admin_user,
                'verified_at': timezone.now(),
                'phone_number': '+91 98471 00001'
            }
        )
        teacher_demo.is_verified = True
        teacher_demo.verification_status = VerificationStatus.APPROVED
        teacher_demo.verified_by = admin_user
        teacher_demo.set_password('Teacher@123')
        teacher_demo.save()
        TeacherProfile.objects.get_or_create(
            user=teacher_demo,
            defaults={
                'employee_id': 'TCH-DEMO-01',
                'department': 'Arts & Cultural Affairs',
                'designation': 'Senior Cultural Coordinator & Fest In-Charge',
                'can_create_events': True,
                'can_generate_certificates': True
            }
        )

        teacher2, _ = User.objects.get_or_create(
            username='teacher_rahul',
            defaults={
                'email': 'rahul.menon@schoolfest.edu',
                'first_name': 'Rahul',
                'last_name': 'Menon',
                'role': UserRole.TEACHER,
                'is_verified': True,
                'verification_status': VerificationStatus.APPROVED,
                'verified_by': admin_user,
                'verified_at': timezone.now(),
                'phone_number': '+91 98472 34567'
            }
        )
        teacher2.is_verified = True
        teacher2.verification_status = VerificationStatus.APPROVED
        teacher2.verified_by = admin_user
        teacher2.set_password('Teacher@123')
        teacher2.save()
        TeacherProfile.objects.get_or_create(
            user=teacher2,
            defaults={
                'employee_id': 'TCH-0102',
                'department': 'Science & Literary',
                'designation': 'HOD Science & Literary Convener',
                'can_create_events': True,
                'can_generate_certificates': True
            }
        )

        # Teacher (Pending Verification - Demo)
        teacher_pending, _ = User.objects.get_or_create(
            username='teacher_kavitha',
            defaults={
                'email': 'kavitha.nair@schoolfest.edu',
                'first_name': 'Kavitha',
                'last_name': 'Nair',
                'role': UserRole.TEACHER,
                'is_verified': False,
                'verification_status': VerificationStatus.PENDING,
                'phone_number': '+91 98475 11223'
            }
        )
        teacher_pending.set_password('Teacher@123')
        teacher_pending.save()
        TeacherProfile.objects.get_or_create(
            user=teacher_pending,
            defaults={
                'employee_id': 'TCH-0105',
                'department': 'Mathematics & IT',
                'designation': 'Assistant Teacher',
                'can_create_events': False,
                'can_generate_certificates': False
            }
        )

        # Parents (Approved)
        parent1, _ = User.objects.get_or_create(
            username='parent_priya',
            defaults={
                'email': 'priya.nair@example.com',
                'first_name': 'Priya',
                'last_name': 'Nair',
                'role': UserRole.PARENT,
                'is_verified': True,
                'verification_status': VerificationStatus.APPROVED,
                'verified_by': admin_user,
                'verified_at': timezone.now(),
                'phone_number': '+91 94473 45678'
            }
        )
        parent1.is_verified = True
        parent1.verification_status = VerificationStatus.APPROVED
        parent1.verified_by = admin_user
        parent1.set_password('Parent@123')
        parent1.save()
        parent_profile1, _ = ParentProfile.objects.get_or_create(
            user=parent1,
            defaults={
                'occupation': 'Software Architect',
                'address': 'Grace Villa, Panampilly Nagar, Kochi, Kerala',
                'alternate_phone': '+91 94473 45679'
            }
        )

        # Demo Verified Parent Account (username: parent / password: Parent@123)
        parent_demo, _ = User.objects.get_or_create(
            username='parent',
            defaults={
                'email': 'parent@schoolfest.edu',
                'first_name': 'Priya',
                'last_name': 'Nair',
                'role': UserRole.PARENT,
                'is_verified': True,
                'verification_status': VerificationStatus.APPROVED,
                'verified_by': admin_user,
                'verified_at': timezone.now(),
                'phone_number': '+91 94473 00002'
            }
        )
        parent_demo.is_verified = True
        parent_demo.verification_status = VerificationStatus.APPROVED
        parent_demo.verified_by = admin_user
        parent_demo.set_password('Parent@123')
        parent_demo.save()
        parent_profile_demo, _ = ParentProfile.objects.get_or_create(
            user=parent_demo,
            defaults={
                'occupation': 'Software Architect',
                'address': 'Grace Villa, West Fort, Thrissur, Kerala',
                'alternate_phone': '+91 94473 00003'
            }
        )

        parent2, _ = User.objects.get_or_create(
            username='parent_suresh',
            defaults={
                'email': 'suresh.kumar@example.com',
                'first_name': 'Suresh',
                'last_name': 'Kumar',
                'role': UserRole.PARENT,
                'is_verified': True,
                'verification_status': VerificationStatus.APPROVED,
                'verified_by': admin_user,
                'verified_at': timezone.now(),
                'phone_number': '+91 94474 56789'
            }
        )
        parent2.is_verified = True
        parent2.verification_status = VerificationStatus.APPROVED
        parent2.verified_by = admin_user
        parent2.set_password('Parent@123')
        parent2.save()
        parent_profile2, _ = ParentProfile.objects.get_or_create(
            user=parent2,
            defaults={
                'occupation': 'Civil Engineer',
                'address': 'Pournami, Marine Drive, Kochi, Kerala'
            }
        )

        # Parent (Pending Verification - Demo)
        parent_pending, _ = User.objects.get_or_create(
            username='parent_rajesh',
            defaults={
                'email': 'rajesh.krishnan@example.com',
                'first_name': 'Rajesh',
                'last_name': 'Krishnan',
                'role': UserRole.PARENT,
                'is_verified': False,
                'verification_status': VerificationStatus.PENDING,
                'phone_number': '+91 94475 99887'
            }
        )
        parent_pending.set_password('Parent@123')
        parent_pending.save()
        ParentProfile.objects.get_or_create(
            user=parent_pending,
            defaults={
                'occupation': 'Senior Accountant',
                'address': 'Krishna Kripa, Vyttila, Kochi',
                'requested_admission_number': 'ADM-2024-004',
                'requested_relationship': 'Father'
            }
        )

        self.stdout.write("Created Admin, Teachers, and Parents (Approved & Pending Demo)")

        # 4. Students (Data records only - NO login)
        students_raw = [
        #     # High School Section Students (Classes 8-12)
            ('ADM-2024-001', 'Arjun', 'Nair', 'അർജുൻ നായർ', '10', 'A', 'HS', 'Orange', 'M'),
            ('ADM-2024-002', 'Ananya', 'Nair', 'അനന്യ നായർ', '8', 'B', 'HS', 'Orange', 'F'),
            ('ADM-2024-003', 'Devika', 'Suresh', 'ദേവിക സുരേഷ്', '10', 'B', 'HS', 'Blue', 'F'),
            ('ADM-2024-004', 'Kavya', 'Krishnan', 'കാവ്യ കൃഷ്ണൻ', '10', 'A', 'HS', 'Yellow', 'F'),
            ('ADM-2024-005', 'Fahad', 'Rahman', 'ഫഹദ് റഹ്മാൻ', '11', 'A', 'HS', 'Green', 'M'),
            ('ADM-2024-006', 'Siddharth', 'Varma', 'സിദ്ധാർത്ഥ് വർമ്മ', '12', 'A', 'HS', 'Blue', 'M'),
            ('ADM-2024-007', 'Nandana', 'Ramesh', 'നന്ദന രമേഷ്', '9', 'A', 'HS', 'Yellow', 'F'),
            ('ADM-2024-008', 'Vishnu', 'Prasad', 'വിഷ്ണു പ്രസാദ്', '10', 'A', 'HS', 'Green', 'M'),
            ('ADM-2024-009', 'Sneha', 'Paul', 'സ്നേഹ പോൾ', '11', 'B', 'HS', 'Orange', 'F'),
            ('ADM-2024-010', 'Adithya', 'Nath', 'ആദിത്യ നാഥ്', '9', 'B', 'HS', 'Yellow', 'M'),
        #     # UP Section Students (Classes 5-7)
            ('ADM-2024-011', 'Athul', 'Krishna', 'അതുൽ കൃഷ്ണ', '5', 'A', 'UP', 'Orange', 'M'),
            ('ADM-2024-012', 'Sneha', 'Krishnan', 'സ്നേഹ കൃഷ്ണൻ', '6', 'B', 'UP', 'Yellow', 'F'),
            ('ADM-2024-013', 'Farhan', 'Ali', 'ഫർഹാൻ അലി', '7', 'A', 'UP', 'Green', 'M'),
            ('ADM-2024-014', 'Sandra', 'Thomas', 'സാന്ദ്ര തോമസ്', '6', 'A', 'UP', 'Blue', 'F'),
            ('ADM-2024-015', 'Gokul', 'R', 'ഗോകുൽ ആർ', '7', 'B', 'UP', 'Orange', 'M'),
            # Competitors from CSHSS Event Register (Handwritten Record)
            ('ADM-2024-016', 'Muhammed', 'Rihan', 'മുഹമ്മദ് റിഹാൻ', '9', 'G', 'HS', 'Blue', 'M'),
            ('ADM-2024-017', 'Ashfaq', 'Aboobakar', 'അഷ്ഫാഖ് അബൂബക്കർ', '9', 'G', 'HS', 'Green', 'M'),
            ('ADM-2024-018', 'Lasib', 'C H', 'ലസീബ് സി എച്ച്', '9', 'F', 'HS', 'Blue', 'M'),
            ('ADM-2024-019', 'Sneha', 'T J', 'സ്നേഹ ടി ജെ', '9', 'A', 'HS', 'Yellow', 'F'),
            ('ADM-2024-020', 'Asmina', 'Biju', 'അസ്മിന ബിജു', '8', 'C', 'HS', 'Blue', 'F'),
            ('ADM-2024-021', 'Rasla', 'Fathima', 'റസ്‌ല ഫാത്തിമ', '10', 'A', 'HS', 'Blue', 'F'),
            ('ADM-2024-022', 'Angela', 'K Lenin', 'ഏഞ്ചല കെ ലെനിൻ', '10', 'B', 'HS', 'Blue', 'F'),
            ('ADM-2024-023', 'Indubala', 'Satheesh', 'ഇന്ദുബാല സതീഷ്', '10', 'F', 'HS', 'Green', 'F'),
            ('ADM-2024-024', 'Merlin', 'Vinod', 'മെർലിൻ വിനോദ്', '10', 'C', 'HS', 'Orange', 'F'),
        ]

        students = {}
        for adm, fname, lname, mlname, cname, div, sec, hname, g in students_raw:
            st, _ = Student.objects.get_or_create(
                admission_number=adm,
                defaults={
                    'first_name': fname,
                    'last_name': lname,
                    'malayalam_name': mlname,
                    'class_name': cname,
                    'division': div,
                    'school_section': sec,
                    'house': houses[hname],
                    'gender': g,
                    'academic_year': '2025-2026',
                    'is_active': True,
                    'is_archived': False
                }
            )
            st.school_section = sec
            st.save()
            students[adm] = st

        # # Link parent to students
        ParentStudentRelationship.objects.get_or_create(
            parent=parent_profile_demo, student=students['ADM-2024-018'],
            defaults={'relationship_type': 'Mother'}
        )
        ParentStudentRelationship.objects.get_or_create(
            parent=parent_profile_demo, student=students['ADM-2024-022'],
            defaults={'relationship_type': 'Mother'}
        )
        ParentStudentRelationship.objects.get_or_create(
            parent=parent_profile1, student=students['ADM-2024-001'],
            defaults={'relationship_type': 'Mother'}
        )
        ParentStudentRelationship.objects.get_or_create(
            parent=parent_profile1, student=students['ADM-2024-002'],
            defaults={'relationship_type': 'Mother'}
        )
        ParentStudentRelationship.objects.get_or_create(
            parent=parent_profile2, student=students['ADM-2024-003'],
            defaults={'relationship_type': 'Father'}
        )

        # # Seed child link requests for demo pending parent
        ParentChildLinkRequest.objects.get_or_create(
            parent=ParentProfile.objects.get(user=parent_pending),
            student_admission_number='ADM-2024-004',
            defaults={
                'student_name': 'Kavya Krishnan',
                'class_name': '10',
                'division': 'A',
                'relationship_type': 'Father',
                'status': 'PENDING',
                'matched_student': students['ADM-2024-004']
            }
        )
        ParentChildLinkRequest.objects.get_or_create(
            parent=ParentProfile.objects.get(user=parent_pending),
            student_admission_number='ADM-2024-012',
            defaults={
                'student_name': 'Sneha Krishnan',
                'class_name': '6',
                'division': 'B',
                'relationship_type': 'Father',
                'status': 'PENDING',
                'matched_student': students['ADM-2024-012']
            }
        )
        self.stdout.write("Created Students and Linked Parents & Pending Requests")

        # # 5. Categories
        categories_data = [
            ('Sports & Athletics', 'കായിക മത്സരങ്ങൾ', 'track', 'Track, field, and outdoor sports competitions'),
            ('Arts & Painting', 'ചിത്രരചന & കലകൾ', 'palette', 'Drawing, watercolor, pencil sketch, and craft'),
            ('Cultural & Dance', 'സാംസ്കാരികം & നൃത്തം', 'sparkles', 'Classical, folk dance, music, and orchestra'),
            ('Literary Competitions', 'സാഹിത്യ മത്സരങ്ങൾ', 'book-open', 'Elocution, debate, essay writing, and recitation in EN & ML'),
            ('Academic & Science', 'അക്കാദമിക് & ശാസ്ത്രം', 'award', 'Science exhibition, math olympiad, and general quiz'),
        ]
        cats = {}
        for cname, cml, icon, desc in categories_data:
            cat_obj, _ = EventCategory.objects.get_or_create(
                name=cname,
                defaults={'name_ml': cml, 'icon': icon, 'description': desc}
            )
            cats[cname] = cat_obj

        # # 6. Events
        now = timezone.now()
        today = now.date()

        # # Event 1: 100m Sprint (Completed, Published results)
        ev1, _ = Event.objects.get_or_create(
            name='100m Sprint Senior Boys',
            defaults={
                'name_ml': '100 മീറ്റർ ഓട്ടം (സീനിയർ ആൺകുട്ടികൾ)',
                'category': cats['Sports & Athletics'],
                'description': 'Annual track and field championship senior boys 100 meter dash.',
                'description_ml': 'സ്കൂൾ വാർഷിക കായികമേളയിലെ സീനിയർ ആൺകുട്ടികളുടെ 100 മീറ്റർ ഓട്ടമത്സരം.',
                'event_date': today - timedelta(days=2),
                'start_time': '09:00:00',
                'end_time': '10:30:00',
                'venue': 'CSHSS Main Athletics Ground, Thrissur',
                'coordinating_teacher': teacher1,
                'participating_classes': '10,11,12',
                'school_section': 'HS',
                'event_type': EventType.INDIVIDUAL,
                'max_participants': 16,
                'registration_open_date': now - timedelta(days=10),
                'registration_close_date': now - timedelta(days=3),
                'rules': 'Standard IAAF rules apply. False start leads to disqualification.',
                'scoring_criteria': 'Electronic finish line timer ranking.',
                'status': EventStatus.RESULTS_PUBLISHED,
                'academic_year': '2025-2026'
            }
        )
        ev1.school_section = 'HS'
        ev1.save()

        # # Event 2: Classical Dance (Bharatanatyam) (Completed, Published results)
        ev2, _ = Event.objects.get_or_create(
            name='Bharatanatyam Classical Solo',
            defaults={
                'name_ml': 'ഭരതനാട്യം ക്ലാസിക്കൽ സോളോ',
                'category': cats['Cultural & Dance'],
                'description': 'Classical dance presentation judging bhava, raga, and tala.',
                'description_ml': 'ഭാവവും രാഗവും താളവും വിലയിരുത്തുന്ന ശാസ്ത്രീയ നൃത്ത മത്സരം.',
                'event_date': today - timedelta(days=1),
                'start_time': '11:00:00',
                'end_time': '13:00:00',
                'venue': 'CSHSS Centenary Auditorium, Stage 1',
                'coordinating_teacher': teacher1,
                'participating_classes': '8,9,10,11,12',
                'school_section': 'HS',
                'event_type': EventType.INDIVIDUAL,
                'max_participants': 20,
                'registration_open_date': now - timedelta(days=12),
                'registration_close_date': now - timedelta(days=2),
                'rules': 'Maximum time limit is 10 minutes. Recorded soundtrack on USB.',
                'scoring_criteria': 'Tala (25), Abhinaya (25), Costume (25), Overall Presentation (25).',
                'status': EventStatus.RESULTS_PUBLISHED,
                'academic_year': '2025-2026'
            }
        )
        ev2.school_section = 'HS'
        ev2.save()

        # # Event 3: Malayalam Elocution (Results Pending Approval)
        ev3, _ = Event.objects.get_or_create(
            name='Malayalam Elocution Senior',
            defaults={
                'name_ml': 'മലയാള പ്രസംഗ മത്സരം (സീനിയർ)',
                'category': cats['Literary Competitions'],
                'description': 'Speech on "Social Harmony and Environmental Responsibility".',
                'description_ml': '"സാമൂഹിക ഐക്യവും പരിസ്ഥിതി സംരക്ഷണവും" എന്ന വിഷയത്തിലുള്ള പ്രസംഗം.',
                'event_date': today,
                'start_time': '14:00:00',
                'end_time': '16:00:00',
                'venue': 'Seminar Hall Block B',
                'coordinating_teacher': teacher2,
                'participating_classes': '9,10,11,12',
                'school_section': 'HS',
                'event_type': EventType.INDIVIDUAL,
                'max_participants': 15,
                'registration_open_date': now - timedelta(days=8),
                'registration_close_date': now - timedelta(hours=4),
                'rules': 'Time limit 5 minutes. Bell at 4 mins.',
                'status': EventStatus.RESULTS_PENDING,
                'academic_year': '2025-2026'
            }
        )
        ev3.school_section = 'HS'
        ev3.save()

        # # Event 4: Creative Watercolor Painting (OPEN with active countdown)
        ev4, _ = Event.objects.get_or_create(
            name='Creative Watercolor Landscape',
            defaults={
                'name_ml': 'വാട്ടർ കളർ ലാൻഡ്സ്കേപ്പ് പെയിന്റിംഗ്',
                'category': cats['Arts & Painting'],
                'description': 'On-the-spot watercolor painting competition depicting Kerala scenery.',
                'description_ml': 'കേരളീയ പ്രകൃതിഭംഗി വിഷയമാക്കിയുള്ള തത്സമയ ചിത്രരചന.',
                'event_date': today + timedelta(days=3),
                'start_time': '10:00:00',
                'end_time': '12:30:00',
                'venue': 'Fine Arts Studio & Courtyard',
                'coordinating_teacher': teacher2,
                'participating_classes': 'All',
                'school_section': 'ALL',
                'event_type': EventType.INDIVIDUAL,
                'max_participants': 30,
                'registration_open_date': now - timedelta(days=2),
                'registration_close_date': now + timedelta(days=2, hours=18), # Open!
                'rules': 'Drawing chart provided. Participants must bring own colors and brushes.',
                'status': EventStatus.OPEN,
                'academic_year': '2025-2026'
            }
        )
        ev4.school_section = 'ALL'
        ev4.save()

        # # Event 5: Science Quiz Championship (CLOSED - registration deadline passed)
        ev5, _ = Event.objects.get_or_create(
            name='Inter-House Science Quiz',
            defaults={
                'name_ml': 'ഇന്റർ ഹൗസ് സയൻസ് ക്വിസ്',
                'category': cats['Academic & Science'],
                'description': 'Buzzer round science and technology quiz for house glory.',
                'description_ml': 'ശാസ്ത്ര സാങ്കേതിക വിജ്ഞാനത്തെ ആസ്പദമാക്കിയുള്ള ബസ്സർ റൗണ്ട് ക്വിസ്.',
                'event_date': today + timedelta(days=1),
                'start_time': '15:00:00',
                'end_time': '17:00:00',
                'venue': 'Centenary Memorial Auditorium',
                'coordinating_teacher': teacher2,
                'participating_classes': '9,10,11,12',
                'school_section': 'HS',
                'event_type': EventType.INDIVIDUAL,
                'max_participants': 12,
                'registration_open_date': now - timedelta(days=5),
                'registration_close_date': now - timedelta(hours=2), # Closed!
                'rules': 'Standard quiz format with negative marking in final round.',
                'status': EventStatus.CLOSED,
                'academic_year': '2025-2026'
            }
        )
        ev5.school_section = 'HS'
        ev5.save()

        # # UP Event 1: UP Malayalam Story Writing (Completed, Published)
        ev_up1, _ = Event.objects.get_or_create(
            name='UP Section Malayalam Story Writing',
            defaults={
                'name_ml': 'യു.പി. വിഭാഗം മലയാള കഥാരചന',
                'category': cats['Literary Competitions'],
                'description': 'Creative Malayalam short story writing for UP Section classes 5, 6, and 7.',
                'description_ml': 'യു.പി. വിഭാഗം കുട്ടികൾക്കായുള്ള മലയാള ചെറുകഥാ രചന മത്സരം.',
                'event_date': today - timedelta(days=1),
                'start_time': '10:00:00',
                'end_time': '11:30:00',
                'venue': 'CSHSS Primary Library Hall',
                'coordinating_teacher': teacher2,
                'participating_classes': '5,6,7',
                'school_section': 'UP',
                'event_type': EventType.INDIVIDUAL,
                'max_participants': 20,
                'registration_open_date': now - timedelta(days=7),
                'registration_close_date': now - timedelta(days=1),
                'rules': 'Topic provided at time of competition. Word limit: 500 words.',
                'status': EventStatus.RESULTS_PUBLISHED,
                'academic_year': '2025-2026'
            }
        )
        ev_up1.school_section = 'UP'
        ev_up1.save()

        # # UP Event 2: UP Pencil Drawing (Open)
        ev_up2, _ = Event.objects.get_or_create(
            name='UP Section Pencil Drawing',
            defaults={
                'name_ml': 'യു.പി. വിഭാഗം പെൻസിൽ ഡ്രോയിംഗ്',
                'category': cats['Arts & Painting'],
                'description': 'Pencil sketching competition for classes 5 to 7.',
                'description_ml': '5 മുതൽ 7 വരെയുള്ള ക്ലാസുകളിലെ കുട്ടികൾക്കായുള്ള പെൻസിൽ ഡ്രോയിംഗ് മത്സരം.',
                'event_date': today + timedelta(days=2),
                'start_time': '11:00:00',
                'end_time': '12:30:00',
                'venue': 'Junior Art Room 5',
                'coordinating_teacher': teacher1,
                'participating_classes': '5,6,7',
                'school_section': 'UP',
                'event_type': EventType.INDIVIDUAL,
                'max_participants': 25,
                'registration_open_date': now - timedelta(days=3),
                'registration_close_date': now + timedelta(days=1),
                'rules': 'Paper provided. Use graphite pencils only.',
                'status': EventStatus.OPEN,
                'academic_year': '2025-2026'
            }
        )
        ev_up2.school_section = 'UP'
        ev_up2.save()

        # # Results for UP Event 1
        res_up1, _ = Result.objects.get_or_create(
            event=ev_up1,
            student=students['ADM-2024-011'], # Athul Krishna (orange)
            defaults={
                'marks_obtained': 92.50,
                'position': ResultPosition.FIRST,
                'award': 'First Prize (A Grade)',
                'award_ml': 'ഒന്നാം സ്ഥാനം (എ ഗ്രേഡ്)',
                'grade': 'A',
                'approval_status': ApprovalStatus.APPROVED,
                'is_published': True,
                'submitted_by': teacher2,
                'approved_by': admin_user,
                'approved_at': timezone.now()
            }
        )
        HouseScoreTransaction.objects.get_or_create(
            house=houses['Orange'],
            result=res_up1,
            defaults={
                'event': ev_up1,
                'points': 10,
                'reason': 'UP Section Malayalam Story Writing - 1st Place',
                'transaction_type': TransactionType.RESULT_POINTS,
                'academic_year': '2025-2026',
                'created_by': admin_user
            }
        )

        res_up2, _ = Result.objects.get_or_create(
            event=ev_up1,
            student=students['ADM-2024-014'], # Sandra Thomas (Blue)
            defaults={
                'marks_obtained': 88.00,
                'position': ResultPosition.SECOND,
                'award': 'Second Prize (A Grade)',
                'award_ml': 'രണ്ടാം സ്ഥാനം (എ ഗ്രേഡ്)',
                'grade': 'A',
                'approval_status': ApprovalStatus.APPROVED,
                'is_published': True,
                'submitted_by': teacher2,
                'approved_by': admin_user,
                'approved_at': timezone.now()
            }
        )
        HouseScoreTransaction.objects.get_or_create(
            house=houses['Blue'],
            result=res_up2,
            defaults={
                'event': ev_up1,
                'points': 7,
                'reason': 'UP Section Malayalam Story Writing - 2nd Place',
                'transaction_type': TransactionType.RESULT_POINTS,
                'academic_year': '2025-2026',
                'created_by': admin_user
            }
        )

        self.stdout.write("Created Sample Events with distinct statuses & deadlines")

        # # 7. Participants
        # # In ev1 (100m sprint): Arjun Nair, Fahad Rahman, Vishnu Prasad
        EventParticipant.objects.get_or_create(
            event=ev1, student=students['ADM-2024-001'],
            defaults={'chest_number': 'C-101', 'registered_by': teacher1}
        )
        EventParticipant.objects.get_or_create(
            event=ev1, student=students['ADM-2024-005'],
            defaults={'chest_number': 'C-102', 'registered_by': teacher1}
        )
        EventParticipant.objects.get_or_create(
            event=ev1, student=students['ADM-2024-008'],
            defaults={'chest_number': 'C-103', 'registered_by': teacher1}
        )

        # # In ev2 (Bharatanatyam): Devika Suresh, Kavya Krishnan, Nandana Ramesh
        EventParticipant.objects.get_or_create(
            event=ev2, student=students['ADM-2024-003'],
            defaults={'chest_number': 'C-201', 'registered_by': teacher1}
        )
        EventParticipant.objects.get_or_create(
            event=ev2, student=students['ADM-2024-004'],
            defaults={'chest_number': 'C-202', 'registered_by': teacher1}
        )
        EventParticipant.objects.get_or_create(
            event=ev2, student=students['ADM-2024-007'],
            defaults={'chest_number': 'C-203', 'registered_by': teacher1}
        )

        # # In ev3 (Elocution): Ananya Nair, Siddharth Varma
        EventParticipant.objects.get_or_create(
            event=ev3, student=students['ADM-2024-002'],
            defaults={'chest_number': 'C-301', 'registered_by': teacher2}
        )
        EventParticipant.objects.get_or_create(
            event=ev3, student=students['ADM-2024-006'],
            defaults={'chest_number': 'C-302', 'registered_by': teacher2}
        )

        # # In ev4 (Painting - Open): Sneha Paul
        EventParticipant.objects.get_or_create(
            event=ev4, student=students['ADM-2024-009'],
            defaults={'chest_number': 'C-401', 'registered_by': teacher2}
        )

        # # 8. Results for ev1 (100m Sprint)
        # # 1st Place: Arjun Nair (Orange House) -> 10 pts
        r1, _ = Result.objects.get_or_create(
            event=ev1, student=students['ADM-2024-001'],
            defaults={
                'marks_obtained': 98.50,
                'max_marks': 100.00,
                'position': ResultPosition.FIRST,
                'award': 'Gold Medal & First Prize',
                'award_ml': 'സ്വർണ്ണ മെഡലും ഒന്നാം സമ്മാനവും',
                'grade': 'A+',
                'judge_comments': 'Exceptional sprint technique and blistering start.',
                'approval_status': ApprovalStatus.APPROVED,
                'submitted_by': teacher1,
                'submitted_at': now - timedelta(days=2),
                'approved_by': admin_user,
                'approved_at': now - timedelta(days=1),
                'is_published': True,
                'certificate_eligible': True
            }
        )
        HouseScoreTransaction.objects.get_or_create(
            house=houses['Orange'],
            result=r1,
            defaults={
                'event': ev1,
                'points': 10,
                'reason': '100m Sprint Senior Boys - 1st Place (Arjun Nair)',
                'transaction_type': TransactionType.RESULT_POINTS,
                'academic_year': '2025-2026',
                'created_by': admin_user
            }
        )

        # # 2nd Place: Fahad Rahman (Green House) -> 7 pts
        r2, _ = Result.objects.get_or_create(
            event=ev1, student=students['ADM-2024-005'],
            defaults={
                'marks_obtained': 94.00,
                'max_marks': 100.00,
                'position': ResultPosition.SECOND,
                'award': 'Silver Medal & Second Prize',
                'award_ml': 'വെള്ളി മെഡലും രണ്ടാം സമ്മാനവും',
                'grade': 'A',
                'judge_comments': 'Strong acceleration in the final 30 meters.',
                'approval_status': ApprovalStatus.APPROVED,
                'submitted_by': teacher1,
                'submitted_at': now - timedelta(days=2),
                'approved_by': admin_user,
                'approved_at': now - timedelta(days=1),
                'is_published': True,
                'certificate_eligible': True
            }
        )
        HouseScoreTransaction.objects.get_or_create(
            house=houses['Green'],
            result=r2,
            defaults={
                'event': ev1,
                'points': 7,
                'reason': '100m Sprint Senior Boys - 2nd Place (Fahad Rahman)',
                'transaction_type': TransactionType.RESULT_POINTS,
                'academic_year': '2025-2026',
                'created_by': admin_user
            }
        )

        # # 3rd Place: Vishnu Prasad (Green House) -> 5 pts
        r3, _ = Result.objects.get_or_create(
            event=ev1, student=students['ADM-2024-008'],
            defaults={
                'marks_obtained': 89.00,
                'max_marks': 100.00,
                'position': ResultPosition.THIRD,
                'award': 'Bronze Medal & Third Prize',
                'award_ml': 'വെങ്കല മെഡലും മൂന്നാം സമ്മാനവും',
                'grade': 'B+',
                'judge_comments': 'Good stride cadence.',
                'approval_status': ApprovalStatus.APPROVED,
                'submitted_by': teacher1,
                'submitted_at': now - timedelta(days=2),
                'approved_by': admin_user,
                'approved_at': now - timedelta(days=1),
                'is_published': True,
                'certificate_eligible': True
            }
        )
        HouseScoreTransaction.objects.get_or_create(
            house=houses['Green'],
            result=r3,
            defaults={
                'event': ev1,
                'points': 5,
                'reason': '100m Sprint Senior Boys - 3rd Place (Vishnu Prasad)',
                'transaction_type': TransactionType.RESULT_POINTS,
                'academic_year': '2025-2026',
                'created_by': admin_user
            }
        )

        # # Results for ev2 (Bharatanatyam):
        # # 1st Place: Devika Suresh (Blue House) -> 10 pts
        r4, _ = Result.objects.get_or_create(
            event=ev2, student=students['ADM-2024-003'],
            defaults={
                'marks_obtained': 97.00,
                'max_marks': 100.00,
                'position': ResultPosition.FIRST,
                'award': 'First Prize & Kala Thilakam Trophy',
                'award_ml': 'ഒന്നാം സമ്മാനവും കലാതിലകം ട്രോഫിയും',
                'grade': 'A+',
                'judge_comments': 'Captivating abhinaya and flawless footwork rhythm.',
                'approval_status': ApprovalStatus.APPROVED,
                'submitted_by': teacher1,
                'submitted_at': now - timedelta(days=1),
                'approved_by': admin_user,
                'approved_at': now - timedelta(hours=12),
                'is_published': True,
                'certificate_eligible': True
            }
        )
        HouseScoreTransaction.objects.get_or_create(
            house=houses['Blue'],
            result=r4,
            defaults={
                'event': ev2,
                'points': 10,
                'reason': 'Bharatanatyam Solo - 1st Place (Devika Suresh)',
                'transaction_type': TransactionType.RESULT_POINTS,
                'academic_year': '2025-2026',
                'created_by': admin_user
            }
        )

        # # 2nd Place: Kavya Krishnan (Yellow House) -> 7 pts
        r5, _ = Result.objects.get_or_create(
            event=ev2, student=students['ADM-2024-004'],
            defaults={
                'marks_obtained': 92.50,
                'max_marks': 100.00,
                'position': ResultPosition.SECOND,
                'award': 'Second Prize',
                'award_ml': 'രണ്ടാം സമ്മാനം',
                'grade': 'A',
                'judge_comments': 'Graceful posture and neat mudras.',
                'approval_status': ApprovalStatus.APPROVED,
                'submitted_by': teacher1,
                'submitted_at': now - timedelta(days=1),
                'approved_by': admin_user,
                'approved_at': now - timedelta(hours=12),
                'is_published': True,
                'certificate_eligible': True
            }
        )
        HouseScoreTransaction.objects.get_or_create(
            house=houses['Yellow'],
            result=r5,
            defaults={
                'event': ev2,
                'points': 7,
                'reason': 'Bharatanatyam Solo - 2nd Place (Kavya Krishnan)',
                'transaction_type': TransactionType.RESULT_POINTS,
                'academic_year': '2025-2026',
                'created_by': admin_user
            }
        )

        # # 3rd Place: Nandana Ramesh (Yellow House) -> 5 pts
        r6, _ = Result.objects.get_or_create(
            event=ev2, student=students['ADM-2024-007'],
            defaults={
                'marks_obtained': 88.00,
                'max_marks': 100.00,
                'position': ResultPosition.THIRD,
                'award': 'Third Prize',
                'award_ml': 'മൂന്നാം സമ്മാനം',
                'grade': 'B+',
                'judge_comments': 'Good facial expressions and energy.',
                'approval_status': ApprovalStatus.APPROVED,
                'submitted_by': teacher1,
                'submitted_at': now - timedelta(days=1),
                'approved_by': admin_user,
                'approved_at': now - timedelta(hours=12),
                'is_published': True,
                'certificate_eligible': True
            }
        )
        HouseScoreTransaction.objects.get_or_create(
            house=houses['Yellow'],
            result=r6,
            defaults={
                'event': ev2,
                'points': 5,
                'reason': 'Bharatanatyam Solo - 3rd Place (Nandana Ramesh)',
                'transaction_type': TransactionType.RESULT_POINTS,
                'academic_year': '2025-2026',
                'created_by': admin_user
            }
        )

        # # Results for ev3 (Pending Approval):
        Result.objects.get_or_create(
            event=ev3, student=students['ADM-2024-002'],
            defaults={
                'marks_obtained': 91.00,
                'max_marks': 100.00,
                'position': ResultPosition.FIRST,
                'award': 'First Prize',
                'award_ml': 'ഒന്നാം സമ്മാനം',
                'grade': 'A',
                'judge_comments': 'Inspiring speech and clear pronunciation in Malayalam.',
                'approval_status': ApprovalStatus.PENDING_APPROVAL,
                'submitted_by': teacher2,
                'submitted_at': now - timedelta(hours=1),
                'is_published': False
            }
        )

        # # 9. Certificates with unique QR verification tokens!
        # # Certificate 1: Arjun Nair (100m Sprint - 1st)
        c1, _ = Certificate.objects.get_or_create(
            student=students['ADM-2024-001'],
            result=r1,
            defaults={
                'certificate_number': 'SF-2026-0001',
                'verification_token': uuid.UUID('e8179240-6677-4b68-96bb-7d6f5f308b21'),
                'event': ev1,
                'award_title': 'Gold Medal & First Prize',
                'award_title_ml': 'സ്വർണ്ണ മെഡലും ഒന്നാം സമ്മാനവും',
                'status': CertificateStatus.VALID,
                'academic_year': '2025-2026'
            }
        )

        # # Certificate 2: Devika Suresh (Bharatanatyam - 1st)
        c2, _ = Certificate.objects.get_or_create(
            student=students['ADM-2024-003'],
            result=r4,
            defaults={
                'certificate_number': 'SF-2026-0002',
                'verification_token': uuid.UUID('f4289351-7788-4c79-a7cc-8e7a6a419c32'),
                'event': ev2,
                'award_title': 'First Prize & Kala Thilakam Trophy',
                'award_title_ml': 'ഒന്നാം സമ്മാനവും കലാതിലകം ട്രോഫിയും',
                'status': CertificateStatus.VALID,
                'academic_year': '2025-2026'
            }
        )

        # # Certificate 3: Kavya Krishnan (Bharatanatyam - 2nd)
        c3, _ = Certificate.objects.get_or_create(
            student=students['ADM-2024-004'],
            result=r5,
            defaults={
                'certificate_number': 'SF-2026-0003',
                'verification_token': uuid.UUID('a1928374-8899-4d80-b8dd-9f8b7b520d43'),
                'event': ev2,
                'award_title': 'Second Prize',
                'award_title_ml': 'രണ്ടാം സമ്മാനം',
                'status': CertificateStatus.VALID,
                'academic_year': '2025-2026'
            }
        )

        self.stdout.write("Created Sample Certificates and QR verification tokens")
        # 10. Official Competitions from Handwritten Records
        import datetime
        lit_cat = EventCategory.objects.filter(name__icontains='Literary').first() or EventCategory.objects.first()

        img_events_def = [
            {
                'key': 'ev_arabic_poem',
                'name': 'HS Arabic Poem Recitation',
                'name_ml': 'അറബിക് പദ്യം ചൊല്ലൽ (ഹൈസ്കൂൾ)',
                'description': 'High School Arabic poem recitation competition showcasing rhythm, classical pronunciation, and expression.',
                'description_ml': 'ഹൈസ്കൂൾ വിഭാഗം അറബിക് പദ്യം ചൊല്ലൽ മത്സരം.',
                'school_section': 'HS',
                'event_type': EventType.INDIVIDUAL,
                'category': lit_cat,
                'venue': 'Language Lab 1',
                'status': EventStatus.RESULTS_PUBLISHED,
                'academic_year': '2025-2026',
                'max_participants': 30,
                'event_date': (now - timedelta(days=2)).date(),
                'start_time': datetime.time(9, 30),
                'end_time': datetime.time(11, 30),
                'registration_open_date': now - timedelta(days=10),
                'registration_close_date': now - timedelta(days=3),
                'coordinating_teacher': teacher2,
                'rules': 'Maximum 5 minutes. No reference sheets allowed. Judged on pronunciation, intonation, and delivery.'
            },
            {
                'key': 'ev_malayalam_poetry',
                'name': 'HS Malayalam Poetry Writing',
                'name_ml': 'കവിതാരചന മലയാളം (ഹൈസ്കൂൾ)',
                'description': 'High School Malayalam original poetry composition competition on contemporary themes.',
                'description_ml': 'ഹൈസ്കൂൾ വിഭാഗം മലയാളം കവിതാരചന മത്സരം.',
                'school_section': 'HS',
                'event_type': EventType.INDIVIDUAL,
                'category': lit_cat,
                'venue': 'Examination Hall 2',
                'status': EventStatus.RESULTS_PUBLISHED,
                'academic_year': '2025-2026',
                'max_participants': 40,
                'event_date': (now - timedelta(days=2)).date(),
                'start_time': datetime.time(10, 0),
                'end_time': datetime.time(11, 30),
                'registration_open_date': now - timedelta(days=10),
                'registration_close_date': now - timedelta(days=3),
                'coordinating_teacher': teacher2,
                'rules': 'Time duration: 1 hour. Topic provided on the spot. Judged on creativity, metric flow, and vocabulary.'
            },
            {
                'key': 'ev_malayalam_story',
                'name': 'HS Malayalam Story Writing',
                'name_ml': 'കഥാരചന മലയാളം (ഹൈസ്കൂൾ)',
                'description': 'High School Malayalam short story writing competition testing narrative ability and character development.',
                'description_ml': 'ഹൈസ്കൂൾ വിഭാഗം മലയാളം കഥാരചന മത്സരം.',
                'school_section': 'HS',
                'event_type': EventType.INDIVIDUAL,
                'category': lit_cat,
                'venue': 'Seminar Hall A',
                'status': EventStatus.RESULTS_PUBLISHED,
                'academic_year': '2025-2026',
                'max_participants': 40,
                'event_date': (now - timedelta(days=1)).date(),
                'start_time': datetime.time(11, 0),
                'end_time': datetime.time(12, 30),
                'registration_open_date': now - timedelta(days=10),
                'registration_close_date': now - timedelta(days=3),
                'coordinating_teacher': teacher2,
                'rules': 'Time duration: 1.5 hours. Theme provided at start. Judged on plot structure and language.'
            },
            {
                'key': 'ev_malayalam_essay',
                'name': 'HS Malayalam Essay Writing',
                'name_ml': 'ഉപന്യാസം മലയാളം (ഹൈസ്കൂൾ)',
                'description': 'High School Malayalam formal essay writing competition analyzing socio-cultural topics.',
                'description_ml': 'ഹൈസ്കൂൾ വിഭാഗം മലയാളം ഉപന്യാസ രചന മത്സരം.',
                'school_section': 'HS',
                'event_type': EventType.INDIVIDUAL,
                'category': lit_cat,
                'venue': 'Senior Library Hall',
                'status': EventStatus.RESULTS_PUBLISHED,
                'academic_year': '2025-2026',
                'max_participants': 35,
                'event_date': (now - timedelta(days=1)).date(),
                'start_time': datetime.time(14, 0),
                'end_time': datetime.time(15, 30),
                'registration_open_date': now - timedelta(days=10),
                'registration_close_date': now - timedelta(days=3),
                'coordinating_teacher': teacher2,
                'rules': 'Time limit: 1 hour. Structured presentation, critical analysis, and grammar are primary evaluation criteria.'
            }
        ]

        img_events = {}
        for ed in img_events_def:
            ev_o, _ = Event.objects.get_or_create(
                name=ed['name'],
                academic_year=ed['academic_year'],
                defaults={
                    'name_ml': ed['name_ml'],
                    'description': ed['description'],
                    'description_ml': ed['description_ml'],
                    'school_section': ed['school_section'],
                    'event_type': ed['event_type'],
                    'category': ed['category'],
                    'venue': ed['venue'],
                    'status': ed['status'],
                    'max_participants': ed['max_participants'],
                    'event_date': ed['event_date'],
                    'start_time': ed['start_time'],
                    'end_time': ed['end_time'],
                    'registration_open_date': ed['registration_open_date'],
                    'registration_close_date': ed['registration_close_date'],
                    'coordinating_teacher': ed['coordinating_teacher'],
                    'rules': ed['rules']
                }
            )
            ev_o.status = ed['status']
            ev_o.school_section = ed['school_section']
            ev_o.name_ml = ed['name_ml']
            ev_o.save()
            img_events[ed['key']] = ev_o

        img_results_data = [
            (img_events['ev_arabic_poem'], students['ADM-2024-016'], ResultPosition.FIRST, 96.0, 10, 'First Prize', 'ഒന്നാം സമ്മാനം', 'SF-2026-ARAB-01'),
            (img_events['ev_arabic_poem'], students['ADM-2024-017'], ResultPosition.SECOND, 91.5, 7, 'Second Prize', 'രണ്ടാം സമ്മാനം', 'SF-2026-ARAB-02'),
            (img_events['ev_arabic_poem'], students['ADM-2024-018'], ResultPosition.THIRD, 87.0, 5, 'Third Prize', 'മൂന്നാം സമ്മാനം', 'SF-2026-ARAB-03'),

            (img_events['ev_malayalam_poetry'], students['ADM-2024-018'], ResultPosition.FIRST, 95.0, 10, 'First Prize', 'ഒന്നാം സമ്മാനം', 'SF-2026-KAVI-01'),
            (img_events['ev_malayalam_poetry'], students['ADM-2024-019'], ResultPosition.SECOND, 92.0, 7, 'Second Prize', 'രണ്ടാം സമ്മാനം', 'SF-2026-KAVI-02'),
            (img_events['ev_malayalam_poetry'], students['ADM-2024-020'], ResultPosition.THIRD, 86.5, 5, 'Third Prize', 'മൂന്നാം സമ്മാനം', 'SF-2026-KAVI-03'),

            (img_events['ev_malayalam_story'], students['ADM-2024-019'], ResultPosition.FIRST, 97.0, 10, 'First Prize', 'ഒന്നാം സമ്മാനം', 'SF-2026-KADH-01'),
            (img_events['ev_malayalam_story'], students['ADM-2024-021'], ResultPosition.SECOND, 93.0, 7, 'Second Prize', 'രണ്ടാം സമ്മാനം', 'SF-2026-KADH-02'),
            (img_events['ev_malayalam_story'], students['ADM-2024-020'], ResultPosition.THIRD, 88.0, 5, 'Third Prize', 'മൂന്നാം സമ്മാനം', 'SF-2026-KADH-03'),

            (img_events['ev_malayalam_essay'], students['ADM-2024-022'], ResultPosition.FIRST, 98.0, 10, 'First Prize', 'ഒന്നാം സമ്മാനം', 'SF-2026-UPAN-01'),
            (img_events['ev_malayalam_essay'], students['ADM-2024-023'], ResultPosition.SECOND, 94.0, 7, 'Second Prize', 'രണ്ടാം സമ്മാനം', 'SF-2026-UPAN-02'),
            (img_events['ev_malayalam_essay'], students['ADM-2024-024'], ResultPosition.THIRD, 89.5, 5, 'Third Prize', 'മൂന്നാം സമ്മാനം', 'SF-2026-UPAN-03')
        ]

        for ev_x, st_x, pos_x, mark_x, pt_x, aw_x, aw_ml_x, cnum_x in img_results_data:
            EventParticipant.objects.get_or_create(
                event=ev_x,
                student=st_x,
                defaults={
                    'chest_number': f"C-{st_x.class_name}{st_x.division}-{st_x.admission_number.split('-')[-1]}",
                    'registered_by': teacher2,
                    'attended': True
                }
            )
            res_x, _ = Result.objects.get_or_create(
                event=ev_x,
                student=st_x,
                defaults={
                    'position': pos_x,
                    'marks_obtained': mark_x,
                    'max_marks': 100.0,
                    'grade': 'A+' if mark_x >= 95 else 'A',
                    'award': aw_x,
                    'award_ml': aw_ml_x,
                    'approval_status': ApprovalStatus.APPROVED,
                    'is_published': True,
                    'certificate_eligible': True,
                    'submitted_by': teacher2,
                    'submitted_at': now - timedelta(hours=3),
                    'approved_by': admin_user,
                    'approved_at': now - timedelta(hours=1)
                }
            )
            res_x.approval_status = ApprovalStatus.APPROVED
            res_x.is_published = True
            res_x.position = pos_x
            res_x.marks_obtained = mark_x
            res_x.award = aw_x
            res_x.award_ml = aw_ml_x
            res_x.save()
            HouseScoreTransaction.objects.get_or_create(
                result=res_x,
                defaults={
                    'house': st_x.house,
                    'event': ev_x,
                    'points': pt_x,
                    'transaction_type': TransactionType.RESULT_POINTS,
                    'reason': f"{ev_x.name}: {pos_x} Place - {st_x.full_name} ({st_x.house.name} House)",
                    'academic_year': '2025-2026',
                    'created_by': admin_user
                }
            )
            Certificate.objects.get_or_create(
                result=res_x,
                defaults={
                    'certificate_number': cnum_x,
                    'verification_token': uuid.uuid4(),
                    'student': st_x,
                    'event': ev_x,
                    'award_title': f"{aw_x} - {ev_x.name}",
                    'award_title_ml': f"{aw_ml_x} - {ev_x.name_ml}",
                    'status': CertificateStatus.VALID,
                    'academic_year': '2025-2026'
                }
            )
        self.stdout.write("Created High School Literary Competitions, Results & Certificates from handwritten records")

        self.stdout.write(self.style.SUCCESS("SchoolFest Data Seeding Completed Successfully!"))
