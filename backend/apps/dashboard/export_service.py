import io
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from decimal import Decimal

class PDFExportService:
    """Service to generate professional financial audit PDFs."""
    
    def __init__(self, user, data, filters):
        self.user = user
        self.data = data # This will be the result of DashboardService.get_statement()
        self.filters = filters
        self.buffer = io.BytesIO()
        self.styles = getSampleStyleSheet()
        self._setup_styles()

    def _setup_styles(self):
        """Custom styles for the professional audit look."""
        self.styles.add(ParagraphStyle(
            name='AuditHeader',
            fontSize=18,
            leading=22,
            alignment=TA_LEFT,
            textColor=colors.HexColor('#1B2A4A'),
            fontName='Helvetica-Bold'
        ))
        self.styles.add(ParagraphStyle(
            name='AuditSubHeader',
            fontSize=10,
            leading=12,
            alignment=TA_LEFT,
            textColor=colors.HexColor('#64748B'),
            fontName='Helvetica-Bold',
            textTransform='uppercase'
        ))
        self.styles.add(ParagraphStyle(
            name='Label',
            fontSize=8,
            leading=10,
            textColor=colors.HexColor('#94A3B8'),
            fontName='Helvetica-Bold',
            textTransform='uppercase'
        ))
        self.styles.add(ParagraphStyle(
            name='Value',
            fontSize=12,
            leading=14,
            textColor=colors.HexColor('#1E293B'),
            fontName='Helvetica-Bold'
        ))

    def generate(self):
        """Main entry point to build the PDF document."""
        doc = SimpleDocTemplate(
            self.buffer,
            pagesize=A4,
            rightMargin=50,
            leftMargin=50,
            topMargin=50,
            bottomMargin=50
        )
        
        elements = []
        
        # 1. Header Section
        elements.append(Paragraph("KESHO KWAKO OFFICIAL AUDIT", self.styles['AuditSubHeader']))
        elements.append(Spacer(1, 5))
        elements.append(Paragraph("Financial Pulse Statement", self.styles['AuditHeader']))
        elements.append(Spacer(1, 20))
        
        # 2. Account Details Table
        account_data = [
            [
                Paragraph("ACCOUNT HOLDER", self.styles['Label']),
                Paragraph("STATEMENT PERIOD", self.styles['Label']),
                Paragraph("ACCOUNT ID", self.styles['Label'])
            ],
            [
                Paragraph(self.user.display_name or self.user.email, self.styles['Value']),
                Paragraph(self.data['period']['label'], self.styles['Value']),
                Paragraph(str(self.user.id)[:12].upper(), self.styles['Value'])
            ]
        ]
        
        t = Table(account_data, colWidths=[2.2*inch, 2.2*inch, 1.8*inch])
        t.setStyle(TableStyle([
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ]))
        elements.append(t)
        elements.append(Spacer(1, 30))
        
        # 3. Executive Summary (Expert Matrix)
        elements.append(Paragraph("EXECUTIVE SUMMARY", self.styles['AuditSubHeader']))
        elements.append(Spacer(1, 10))
        
        summary_data = [
            ['Total Inflow', 'Total Outflow', 'Net Pulse'],
            [
                f"KSh {float(self.data['total_income']):,.2f}",
                f"KSh {float(self.data['total_expenses']):,.2f}",
                f"KSh {float(self.data['closing_balance']):,.2f}"
            ]
        ]
        
        summary_table = Table(summary_data, colWidths=[2*inch, 2*inch, 2.2*inch])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F8FAFC')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.HexColor('#64748B')),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,0), 8),
            ('BOTTOMPADDING', (0,0), (-1,0), 8),
            ('TOPPADDING', (0,0), (-1,0), 8),
            ('FONTNAME', (0,1), (-1,1), 'Helvetica-Bold'),
            ('FONTSIZE', (0,1), (-1,1), 14),
            ('TEXTCOLOR', (0,1), (0,1), colors.HexColor('#10B981')), # Income
            ('TEXTCOLOR', (1,1), (1,1), colors.HexColor('#EF4444')), # Expense
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
            ('ROUNDEDCORNERS', [10, 10, 10, 10]),
        ]))
        elements.append(summary_table)
        elements.append(Spacer(1, 40))
        
        # 4. Transaction Ledger
        elements.append(Paragraph("TRANSACTION LEDGER", self.styles['AuditSubHeader']))
        elements.append(Spacer(1, 10))
        
        header = ['Date', 'Description', 'Category', 'Amount']
        ledger_data = [header]
        
        for tx in self.data['transactions']:
            # Filter based on scope if needed (already filtered in data but just in case)
            amount_str = f"KSh {float(tx['amount']):,.2f}"
            if tx['type'] == 'income':
                amount_str = f"+ {amount_str}"
            else:
                amount_str = f"- {amount_str}"
                
            ledger_data.append([
                tx['date'],
                tx['description'],
                tx['category'],
                amount_str
            ])
            
        ledger_table = Table(ledger_data, colWidths=[0.8*inch, 2.5*inch, 1.5*inch, 1.2*inch], repeatRows=1)
        
        # Styles for Ledger
        ledger_style = [
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1B2A4A')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('ALIGN', (0,0), (-1,0), 'CENTER'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,0), 9),
            ('BOTTOMPADDING', (0,0), (-1,0), 10),
            ('TOPPADDING', (0,0), (-1,0), 10),
            
            ('FONTSIZE', (0,1), (-1,-1), 8),
            ('BOTTOMPADDING', (0,1), (-1,-1), 8),
            ('TOPPADDING', (0,1), (-1,-1), 8),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('GRID', (0,0), (-1,-1), 0.1, colors.HexColor('#CBD5E1')),
            ('ALIGN', (3,1), (3,-1), 'RIGHT'), # Amount column
        ]
        
        # Color specific rows
        for i in range(1, len(ledger_data)):
            if '+' in ledger_data[i][3]:
                ledger_style.append(('TEXTCOLOR', (3,i), (3,i), colors.HexColor('#059669')))
            else:
                ledger_style.append(('TEXTCOLOR', (3,i), (3,i), colors.HexColor('#DC2626')))
                
        ledger_table.setStyle(TableStyle(ledger_style))
        elements.append(ledger_table)
        
        # 5. Footer
        elements.append(Spacer(1, 40))
        elements.append(Paragraph("--- END OF AUDIT STATEMENT ---", self.styles['AuditSubHeader']))
        elements.append(Spacer(1, 10))
        elements.append(Paragraph(f"Generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} by KeshoKwako Financial Intelligence Engine.", self.styles['Label']))
        
        doc.build(elements)
        pdf = self.buffer.getvalue()
        self.buffer.close()
        return pdf
