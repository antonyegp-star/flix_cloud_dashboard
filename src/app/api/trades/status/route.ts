import { NextResponse } from "next/server";
import { getGoogleSheetsClient, SPREADSHEET_ID, SHEET_NAME } from "@/lib/googleSheets";

export async function POST(request: Request) {
    try {
        const { startDate, endDate, action } = await request.json();

        if (!startDate || !endDate || !["DELETED", "ACTIVE"].includes(action)) {
            return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
        }

        const startTimestamp = new Date(`${startDate}T00:00:00`).getTime();
        const endTimestamp = new Date(`${endDate}T23:59:59`).getTime();

        if (isNaN(startTimestamp) || isNaN(endTimestamp)) {
            return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
        }

        const sheets = await getGoogleSheetsClient();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:Z`,
        });

        const rows = response.data.values;
        if (!rows || rows.length <= 1) {
            return NextResponse.json({ success: true, updatedCount: 0 });
        }

        const updates: any[] = [];
        let updatedCount = 0;

        // Itera sobre las filas empezando desde la 2 (índice 1)
        for (let i = 1; i < rows.length; i++) {
            const rowDateStr = rows[i][1];

            // Validación segura (similar a GET route)
            let rowTimestamp = 0;
            try {
                if (rowDateStr && typeof rowDateStr === 'string' && rowDateStr.trim() !== "" && rowDateStr !== "N/A") {
                    const parts = rowDateStr.split(' ');
                    if (parts.length >= 2) {
                        const dateParts = parts[0].split('.');
                        const timeParts = parts[1].split(':');
                        if (dateParts.length === 3 && timeParts.length >= 2) {
                            const [year, month, day] = dateParts;
                            const [hour, minute, second = "0"] = timeParts;
                            const time = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second)).getTime();
                            if (!isNaN(time)) {
                                rowTimestamp = time;
                            }
                        }
                    }
                }
            } catch (error) {
                // Ignore parse error
            }

            if (rowTimestamp >= startTimestamp && rowTimestamp <= endTimestamp) {
                const sheetRowNumber = i + 1;
                updates.push({
                    range: `${SHEET_NAME}!Q${sheetRowNumber}`,
                    values: [[action]],
                });
                updatedCount++;
            }
        }

        if (updates.length > 0) {
            await sheets.spreadsheets.values.batchUpdate({
                spreadsheetId: SPREADSHEET_ID,
                requestBody: {
                    valueInputOption: "USER_ENTERED",
                    data: updates,
                },
            });
        }

        return NextResponse.json({ success: true, updatedCount });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
