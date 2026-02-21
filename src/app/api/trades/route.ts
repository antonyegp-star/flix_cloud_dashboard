import { NextResponse } from "next/server";
import { getGoogleSheetsClient, SPREADSHEET_ID, SHEET_NAME } from "@/lib/googleSheets";

// Helper to find the index of columns dynamically
const getColumnIndexes = (headers: string[]) => {
    return {
        magic: headers.indexOf("Magic"),
        symbol: headers.indexOf("Symbol"),
        profit: headers.indexOf("Profit"),
        mae: headers.indexOf("MAE"),
        exitReason: headers.indexOf("Razón de salida"),
    };
};

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

        const headers = rows[0];
        const colIndexes = getColumnIndexes(headers);

        const data = rows.slice(1).map((row, index) => {
            return {
                row: index + 2, // 1-based index, skipping header
                magic: colIndexes.magic !== -1 ? row[colIndexes.magic] : "",
                symbol: colIndexes.symbol !== -1 ? row[colIndexes.symbol] : "",
                profit: colIndexes.profit !== -1 ? row[colIndexes.profit] : "",
                mae: colIndexes.mae !== -1 ? row[colIndexes.mae] : "",
                exitReason: colIndexes.exitReason !== -1 ? row[colIndexes.exitReason] : "",
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

        const headResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!1:1`,
        });

        const headers = headResponse.data.values?.[0] || [];
        const colIndexes = getColumnIndexes(headers);

        // Create an update array
        const data = [];
        if (valuesToUpdate.magic && colIndexes.magic !== -1) {
            data.push({
                range: `${SHEET_NAME}!${String.fromCharCode(65 + colIndexes.magic)}${row}`,
                values: [[valuesToUpdate.magic]],
            });
        }
        if (valuesToUpdate.symbol && colIndexes.symbol !== -1) {
            data.push({
                range: `${SHEET_NAME}!${String.fromCharCode(65 + colIndexes.symbol)}${row}`,
                values: [[valuesToUpdate.symbol]],
            });
        }
        if (valuesToUpdate.profit && colIndexes.profit !== -1) {
            data.push({
                range: `${SHEET_NAME}!${String.fromCharCode(65 + colIndexes.profit)}${row}`,
                values: [[valuesToUpdate.profit]],
            });
        }
        if (valuesToUpdate.mae && colIndexes.mae !== -1) {
            data.push({
                range: `${SHEET_NAME}!${String.fromCharCode(65 + colIndexes.mae)}${row}`,
                values: [[valuesToUpdate.mae]],
            });
        }
        if (valuesToUpdate.exitReason && colIndexes.exitReason !== -1) {
            data.push({
                range: `${SHEET_NAME}!${String.fromCharCode(65 + colIndexes.exitReason)}${row}`,
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
