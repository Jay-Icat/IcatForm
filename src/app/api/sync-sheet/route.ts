import { NextRequest, NextResponse } from "next/server";
import { Question, StudentLead } from "@/types/quiz";

function formatLeadToRow(lead: StudentLead, questions: Question[]): Record<string, string> {
  const formattedDate = lead.createdAt
    ? new Date(lead.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
    : new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  const rowData: Record<string, string> = {
    Timestamp: formattedDate,
    Team: lead.teamName || lead.teamId || "Campus Admissions",
    "Team Slug": lead.teamId || "default",
    "Student Name": lead.fullName || "N/A",
    "Phone Number": lead.phoneNumber || "N/A",
    "Gender": lead.gender || "Not Specified",
    "Date of Birth": lead.birthday || "Not Specified",
  };

  // Append each question answer
  questions?.forEach((q, idx) => {
    const qKey = `Q${idx + 1}: ${q.questionText}`;
    const ans = lead.answers?.[q.id];
    if (Array.isArray(ans)) {
      rowData[qKey] = ans.join(", ");
    } else if (typeof ans === "string") {
      rowData[qKey] = ans;
    } else {
      rowData[qKey] = "Not Answered";
    }
  });

  return rowData;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      action = "appendRow",
      lead, 
      leads, 
      questions, 
      webhookUrl: customWebhook 
    } = body as {
      action?: "appendRow" | "bulkAppend" | "ping";
      lead?: StudentLead;
      leads?: StudentLead[];
      questions?: Question[];
      webhookUrl?: string;
    };

    const webhookUrl = (customWebhook || process.env.GOOGLE_SHEET_WEBHOOK_URL || "").trim();

    if (!webhookUrl || !webhookUrl.startsWith("http")) {
      return NextResponse.json({
        success: false,
        message: "Google Sheet Webhook URL not configured. Please paste your Web App URL in the Admin Panel.",
      });
    }

    let payload: any = { action };

    if (action === "ping") {
      payload = {
        action: "ping",
        message: "Test ping from ICAT Interactive Experience",
        timestamp: new Date().toISOString(),
      };
    } else if (action === "bulkAppend" && Array.isArray(leads)) {
      const rows = leads.map((l) => formatLeadToRow(l, questions || []));
      payload = {
        action: "bulkAppend",
        rows: rows,
        count: rows.length,
      };
    } else if (lead) {
      const rowData = formatLeadToRow(lead, questions || []);
      payload = {
        action: "appendRow",
        data: rowData,
        rawLead: lead,
      };
    } else {
      return NextResponse.json({
        success: false,
        message: "Invalid sync request: missing lead data or action.",
      });
    }

    // Post to Google Apps Script
    // Google Apps Script requires text/plain or follows 302 redirects
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
      redirect: "follow",
      cache: "no-store",
    });

    const responseText = await response.text();
    let parsedData: any = {};
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      parsedData = { raw: responseText };
    }

    return NextResponse.json({
      success: true,
      status: response.status,
      details: parsedData,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json(
      { success: false, error: errMessage },
      { status: 500 }
    );
  }
}
