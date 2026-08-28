import { NextRequest, NextResponse } from "next/server";
import { Question, StudentLead } from "@/types/quiz";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lead, questions, webhookUrl: customWebhook } = body as {
      lead: StudentLead;
      questions: Question[];
      webhookUrl?: string;
    };

    const webhookUrl = customWebhook || process.env.GOOGLE_SHEET_WEBHOOK_URL;

    if (!webhookUrl || !webhookUrl.startsWith("http")) {
      return NextResponse.json({
        success: false,
        message: "Google Sheet Webhook URL not configured.",
      });
    }

    // Format row data for Google Sheets
    const formattedDate = lead.createdAt
      ? new Date(lead.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
      : new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    const rowData: Record<string, string> = {
      Timestamp: formattedDate,
      "Student Name": lead.fullName,
      "Phone Number": lead.phoneNumber,
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

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "appendRow",
        data: rowData,
        rawLead: lead,
      }),
    });

    return NextResponse.json({
      success: true,
      status: response.status,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json(
      { success: false, error: errMessage },
      { status: 500 }
    );
  }
}
