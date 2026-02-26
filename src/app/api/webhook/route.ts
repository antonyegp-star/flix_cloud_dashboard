import { NextResponse } from "next/server";
import { getGoogleSheetsClient, SPREADSHEET_ID, SHEET_NAME } from "@/lib/googleSheets";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            ticket, time, symbol, magic, htf, ltf,
            type, reason, entry, exit, profit_usd,
            profit_pts, trail, mfe, mae, eff
        } = body;

        const sheets = await getGoogleSheetsClient();

        // Build a strict 17-element array mapping to Columns A-Q
        const rowData = [
            ticket ?? "",         // Col A (0): ticket
            time ?? "",           // Col B (1): time
            symbol ?? "",         // Col C (2): symbol
            magic ?? "",          // Col D (3): magic
            htf ?? "",            // Col E (4): htf
            ltf ?? "",            // Col F (5): ltf
            type || "TRADE_EXIT", // Col G (6): type (fallback TRADE_EXIT)
            reason ?? "",         // Col H (7): reason (Closed: PROFIT / LOSS)
            entry ?? "0",         // Col I (8): entry
            exit ?? "0",          // Col J (9): exit
            profit_usd ?? "0",    // Col K (10): profit_usd
            profit_pts ?? "0",    // Col L (11): profit_pts
            trail ?? "0",         // Col M (12): trail
            mfe ?? "0",           // Col N (13): mfe
            mae ?? "0",           // Col O (14): mae
            eff ?? "0",           // Col P (15): eff
            "ACTIVE"              // Col Q (16): Logical delete status
        ];

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
