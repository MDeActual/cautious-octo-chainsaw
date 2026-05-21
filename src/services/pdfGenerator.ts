import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function createLaw25AuditPDF(clientName: string, auditData: any) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const { width, height } = page.getSize();

    // 1. Branding (Identity Branding)
    page.drawRectangle({ x: 0, y: height - 50, width, height: 50, color: rgb(0, 0.2, 0.4) }); // SecurePulse Blue
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    page.drawText('SecurePulse Law 25 Compliance Report', { x: 50, y: height - 35, size: 20, color: rgb(1, 1, 1), font: boldFont });

    // 2. Summary Section
    page.drawText(`Prepared for: ${clientName}`, { x: 50, y: height - 100, size: 14 });
    page.drawText(`Compliance Score: ${auditData.score}%`, { x: 50, y: height - 130, size: 24, color: auditData.score < 70 ? rgb(0.8, 0, 0) : rgb(0, 0.6, 0) });

    // 3. Automated Finding Mapping
    let yOffset = height - 200;
    auditData.violations.forEach((v: any) => {
        page.drawText(`${v.section}: ${v.severity}`, { x: 50, y: yOffset, size: 12, font: boldFont });
        page.drawText(v.finding, { x: 50, y: yOffset - 15, size: 10, maxWidth: 500 });
        yOffset -= 60;
    });

    return await pdfDoc.save();
}
