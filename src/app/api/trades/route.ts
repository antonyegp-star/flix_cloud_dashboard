import { NextResponse } from "next/server";
import { getGoogleSheetsClient, SPREADSHEET_ID, SHEET_NAME } from "@/lib/googleSheets";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const sheets = await getGoogleSheetsClient();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:Z`,
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            return NextResponse.json({ data: [] });
        }

        const data = rows.slice(1).map((row: any[], index: number) => {
            return {
                row: index + 2, // 1-based index, skipping header
                magic: row[3] || "0",
                symbol: row[2] || "N/A",
                profit: row[10] || "0",
                mae: row[14] || "0",
                exitReason: row[7] || row[6] || "N/A",
            };
        });

        return NextResponse.json({ data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const { row, indexMap, valuesToUpdate } = await request.json();
        const sheets = await getGoogleSheetsClient();

        // Since indexMap provides the exact column letter or index for what we want to update
        // A simplified update for this institutional prototype: Update specific cells

        // As a robust alternative, we can just update specific ranges.
        // For this prototype, let's assume `valuesToUpdate` maps column names to new values 
        // and we need to fetch headers first to know which columns to update.

        const data: any[] = [];
        if (valuesToUpdate.magic !== undefined) {
            data.push({
                range: `${SHEET_NAME}!D${row}`,
                values: [[valuesToUpdate.magic]],
            });
        }
        if (valuesToUpdate.symbol !== undefined) {
            data.push({
                range: `${SHEET_NAME}!C${row}`,
                values: [[valuesToUpdate.symbol]],
            });
        }
        if (valuesToUpdate.profit !== undefined) {
            data.push({
                range: `${SHEET_NAME}!K${row}`,
                values: [[valuesToUpdate.profit]],
            });
        }
        if (valuesToUpdate.mae !== undefined) {
            data.push({
                range: `${SHEET_NAME}!O${row}`,
                values: [[valuesToUpdate.mae]],
            });
        }
        if (valuesToUpdate.exitReason !== undefined) {
            data.push({
                range: `${SHEET_NAME}!H${row}`,
                values: [[valuesToUpdate.exitReason]],
            });
        }

        await sheets.spreadsheets.values.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            requestBody: {
                valueInputOption: "USER_ENTERED",
                data,
            }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { row } = await request.json();
        const sheets = await getGoogleSheetsClient();

        // First, to delete a row correctly without leaving empty space, we need the sheetId (gid)
        const spreadsheetInfo = await sheets.spreadsheets.get({
            spreadsheetId: SPREADSHEET_ID,
        });

        const sheet = spreadsheetInfo.data.sheets?.find(s => s.properties?.title === SHEET_NAME);
        const sheetId = sheet?.properties?.sheetId;

        if (sheetId === undefined) {
            throw new Error(`Sheet ${SHEET_NAME} not found`);
        }

        // Row indexes in batchUpdate are 0-based
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            requestBody: {
                requests: [
                    {
                        deleteDimension: {
                            range: {
                                sheetId,
                                dimension: "ROWS",
                                startIndex: row - 1,
                                endIndex: row,
                            },
                        },
                    },
                ],
            },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
