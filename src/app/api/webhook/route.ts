import { NextResponse } from "next/server";
import { getGoogleSheetsClient, SPREADSHEET_ID, SHEET_NAME } from "@/lib/googleSheets";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { ticket, time, symbol, magic, profit, reason } = body;

        const sheets = await getGoogleSheetsClient();

        // Build a row array mapping to the specific columns as requested
        // Col A (0): Ticket
        // Col B (1): Time
        // Col C (2): Symbol
        // Col D (3): Magic
        // Col E (4): HTF (empty for now)
        // Col F (5): Type
        // Col G (6): Reason
        // Col K (10): Profit

        const rowData = new Array(15).fill("");
        rowData[0] = ticket || "";
        rowData[1] = time || "";
        rowData[2] = symbol || "";
        rowData[3] = magic || "";
        rowData[6] = reason || "";
        rowData[10] = profit || "0";

        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:Z`,
            valueInputOption: "USER_ENTERED",
            insertDataOption: "INSERT_ROWS",
            requestBody: {
                values: [rowData],
            },
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
