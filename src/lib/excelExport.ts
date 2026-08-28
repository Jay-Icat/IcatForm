import * as XLSX from "xlsx";
import { Question, StudentLead } from "@/types/quiz";

export function exportLeadsToExcel(leads: StudentLead[], questions: Question[]) {
  if (!leads || leads.length === 0) {
    alert("No student submissions to export yet.");
    return;
  }

  // Create question map for easy column lookup
  const questionMap = new Map<string, string>();
  questions.forEach((q, idx) => {
    questionMap.set(q.id, `Q${idx + 1}: ${q.questionText}`);
  });

  // Build dynamic row objects
  const rows = leads.map((lead, index) => {
    const formattedDate = lead.createdAt 
      ? new Date(lead.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
      : "N/A";

    const rowObj: Record<string, string | number> = {
      "S.No": index + 1,
      "Submission Time (IST)": formattedDate,
      "Student Name": lead.fullName,
      "Phone Number": lead.phoneNumber,
    };

    if (lead.email) {
      rowObj["Email"] = lead.email;
    }

    // Add columns for every question
    questions.forEach((q, qIndex) => {
      const colName = `Q${qIndex + 1} (${q.type === "multiple" ? "Multi" : "Single"}) - ${q.questionText}`;
      const selectedAnswers = lead.answers?.[q.id];
      if (Array.isArray(selectedAnswers)) {
        rowObj[colName] = selectedAnswers.join(" | ");
      } else if (typeof selectedAnswers === "string") {
        rowObj[colName] = selectedAnswers;
      } else {
        rowObj[colName] = "Not Answered";
      }
    });

    return rowObj;
  });

  // Generate worksheet and workbook
  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Auto-fit column widths
  const maxProps = Object.keys(rows[0] || {}).map((key) => {
    const headerLength = key.length;
    const maxContentLength = Math.max(
      ...rows.map((r) => String(r[key] ?? "").length),
      headerLength
    );
    return { wch: Math.min(Math.max(maxContentLength + 3, 12), 60) };
  });
  worksheet["!cols"] = maxProps;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "ICAT Leads & Responses");

  // Format file name with timestamp
  const dateStr = new Date().toISOString().slice(0, 10);
  const fileName = `ICAT_College_Quiz_Leads_${dateStr}.xlsx`;

  XLSX.writeFile(workbook, fileName);
}
