import io
import logging
from django.conf import settings
from .models import SchoolSettings

logger = logging.getLogger(__name__)

# Safe optional imports for qrcode, PIL, and reportlab
try:
    import qrcode
except ImportError:
    qrcode = None

try:
    from PIL import Image
except ImportError:
    Image = None

try:
    from reportlab.lib.pagesizes import letter, landscape
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image as RLImage, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.pdfgen import canvas
except ImportError:
    letter = landscape = colors = SimpleDocTemplate = Paragraph = Spacer = RLImage = Table = TableStyle = getSampleStyleSheet = ParagraphStyle = inch = canvas = None


def generate_qr_code_image(verification_url):
    """Generate a PIL Image containing QR code for verification URL"""
    if qrcode is None or Image is None:
        if Image is not None:
            return Image.new('RGB', (100, 100), color=(240, 240, 240))
        return None
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=2,
    )
    qr.add_data(verification_url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    return img


_CanvasBase = canvas.Canvas if canvas is not None else object

class NumberedCanvas(_CanvasBase):
    def __init__(self, *args, **kwargs):
        if canvas is not None:
            super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations()
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self):
        # Draw fancy certificate border
        width, height = self._pagesize
        # Outer border
        self.setStrokeColor(colors.HexColor('#1E3A8A')) # Deep blue
        self.setLineWidth(6)
        self.rect(20, 20, width - 40, height - 40)
        
        # Inner decorative gold border
        self.setStrokeColor(colors.HexColor('#D97706')) # Gold/Amber
        self.setLineWidth(2)
        self.rect(26, 26, width - 52, height - 52)
        
        # Thin inner line
        self.setStrokeColor(colors.HexColor('#93C5FD')) # Light blue
        self.setLineWidth(0.75)
        self.rect(30, 30, width - 60, height - 60)
        
        # Corner decorative accents
        corner_size = 25
        self.setStrokeColor(colors.HexColor('#D97706'))
        self.setLineWidth(2)
        # Top Left
        self.line(30, height - 30 - corner_size, 30 + corner_size, height - 30)
        # Top Right
        self.line(width - 30 - corner_size, height - 30, width - 30, height - 30 - corner_size)
        # Bottom Left
        self.line(30, 30 + corner_size, 30 + corner_size, 30)
        # Bottom Right
        self.line(width - 30 - corner_size, 30, width - 30, 30 + corner_size)


def generate_certificate_pdf(certificate, verification_url=None):
    """
    Generate high quality Landscape PDF Certificate with verification QR code.
    Returns bytes buffer.
    """
    if SimpleDocTemplate is None:
        logger.warning("ReportLab is not installed; returning placeholder PDF buffer.")
        buffer = io.BytesIO()
        buffer.write(b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000056 00000 n \n0000000111 00000 n \ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n178\n%%EOF\n")
        buffer.seek(0)
        return buffer

    if not verification_url:
        verification_url = f"http://127.0.0.1:5173/verify/{certificate.verification_token}"
    buffer = io.BytesIO()
    
    # 11 x 8.5 inches landscape
    doc = SimpleDocTemplate(
        buffer,
        pagesize=landscape(letter),
        leftMargin=45,
        rightMargin=45,
        topMargin=45,
        bottomMargin=45
    )

    school_settings = SchoolSettings.objects.first()
    school_name = school_settings.school_name if school_settings else "Chaldean Syrian Higher Secondary School"
    school_motto = school_settings.school_motto if school_settings else "The fear of the Lord is the beginning of wisdom"

    styles = getSampleStyleSheet()
    
    header_style = ParagraphStyle(
        'SchoolHeader',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor('#1E3A8A'),
        alignment=1, # Center
        spaceAfter=4
    )

    motto_style = ParagraphStyle(
        'Motto',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor('#4B5563'),
        alignment=1,
        spaceAfter=15
    )

    cert_title_style = ParagraphStyle(
        'CertTitle',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#B45309'), # Deep Amber
        alignment=1,
        spaceAfter=12
    )

    body_intro_style = ParagraphStyle(
        'BodyIntro',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#374151'),
        alignment=1,
        spaceAfter=8
    )

    student_name_style = ParagraphStyle(
        'StudentName',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=colors.HexColor('#0F172A'),
        alignment=1,
        spaceAfter=8
    )

    details_style = ParagraphStyle(
        'CertDetails',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=18,
        textColor=colors.HexColor('#1F2937'),
        alignment=1,
        spaceAfter=15
    )

    elements = []
    
    # 1. School Header
    elements.append(Paragraph(school_name.upper(), header_style))
    elements.append(Paragraph(f'"{school_motto}"', motto_style))
    
    # 2. Certificate Title
    elements.append(Paragraph("CERTIFICATE OF ACHIEVEMENT", cert_title_style))
    elements.append(Paragraph("This is proudly presented to", body_intro_style))
    
    # 3. Student Name (with House & Class)
    student = certificate.student
    student_display = student.full_name
    if student.malayalam_name:
        student_display += f" ({student.malayalam_name})"
    elements.append(Paragraph(student_display, student_name_style))
    
    # 4. Award Details
    house_name = student.house.name if student.house else "N/A"
    award_title = certificate.award_title
    event_name = certificate.event.name
    class_div = f"Class {student.class_name}-{student.division}"
    
    details_text = (
        f"of <b>{class_div}</b>, <b>{house_name} House</b>, for securing <b>{award_title}</b> in the event "
        f"<b>'{event_name}'</b> during the School Annual Fest for the academic year <b>{certificate.academic_year}</b>."
    )
    elements.append(Paragraph(details_text, details_style))
    elements.append(Spacer(1, 10))

    # 5. Footer with QR Code, Signatures, and Verification
    # Generate QR Code image
    qr_img = generate_qr_code_image(verification_url)
    qr_buffer = io.BytesIO()
    qr_img.save(qr_buffer, format='PNG')
    qr_buffer.seek(0)
    
    rl_qr = RLImage(qr_buffer, width=1.1*inch, height=1.1*inch)
    
    cert_meta_text = (
        f"<font size=8 color='#6B7280'>"
        f"<b>Certificate No:</b> {certificate.certificate_number}<br/>"
        f"<b>Issue Date:</b> {certificate.issued_at.strftime('%d-%b-%Y')}<br/>"
        f"<b>Status:</b> {certificate.status}<br/>"
        f"Scan QR to verify authenticity online"
        f"</font>"
    )
    cert_meta_para = Paragraph(cert_meta_text, styles['Normal'])

    sig1_text = "<font size=9 color='#1F2937'>_________________________<br/><b>Event Coordinator</b></font>"
    sig2_text = "<font size=9 color='#1F2937'>_________________________<br/><b>Principal / Head of School</b></font>"
    
    footer_data = [
        [
            rl_qr,
            cert_meta_para,
            Paragraph(sig1_text, ParagraphStyle('Sig1', parent=styles['Normal'], alignment=1)),
            Paragraph(sig2_text, ParagraphStyle('Sig2', parent=styles['Normal'], alignment=1))
        ]
    ]

    footer_table = Table(
        footer_data,
        colWidths=[1.2*inch, 2.5*inch, 2.2*inch, 2.2*inch]
    )
    footer_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ALIGN', (2,0), (3,0), 'CENTER'),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    
    elements.append(footer_table)

    doc.build(elements, canvasmaker=NumberedCanvas)
    buffer.seek(0)
    return buffer
