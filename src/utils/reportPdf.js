import PDFDocument from "pdfkit";

export const generateReportPDF = (res, data, type) => {
  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
  });

  // 🔑 IMPORTANT HEADERS
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${type}-learning-report.pdf`
  );

  doc.pipe(res);

  /* ---------- HEADER ---------- */
  doc
    .fillColor("#2563eb")
    .fontSize(26)
    .text("Learning Performance Report", { align: "center" })
    .moveDown(0.5);

  doc
    .fontSize(12)
    .fillColor("gray")
    .text(`Report Type: ${type.toUpperCase()}`, { align: "center" })
    .moveDown(2);

  /* ---------- STATS ---------- */
  doc.fillColor("black").fontSize(18).text("Overview");
  doc.moveDown(0.5);

  const stats = [
    ["Study Hours", `${data.studyHours} hrs`],
    ["Topics Covered", data.topicsCovered],
    ["Quiz Average", `${data.quizAverage}%`],
    ["Improvement", `+${data.improvement}%`],
  ];

  stats.forEach(([label, value]) => {
    doc
      .fontSize(12)
      .fillColor("#111827")
      .text(`${label}: `, { continued: true })
      .fillColor("#2563eb")
      .text(value);
  });

  doc.moveDown(1.5);

  /* ---------- SUBJECT PERFORMANCE ---------- */
  doc.fontSize(18).fillColor("black").text("Subject Performance");
  doc.moveDown(0.5);

  Object.entries(data.subjectPerformance).forEach(([subject, score]) => {
    doc
      .fontSize(12)
      .fillColor("#111827")
      .text(`${subject}: `, { continued: true })
      .fillColor(score >= 70 ? "#16a34a" : "#dc2626")
      .text(`${score}%`);
  });

  doc.moveDown(2);

  /* ---------- INSIGHTS ---------- */
  doc.fontSize(16).fillColor("black").text("Insights");
  doc.moveDown(0.3);

  doc.fontSize(12).fillColor("#374151").text(data.insights);

  doc.end(); // 🔑 MUST end stream
};
