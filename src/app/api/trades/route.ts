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

        const data = rows
            .slice(1)
            .map((row: any[], index: number) => {
                return {
                    row: index + 2, // 1-based index, skipping header
                    time: row[1] || "N/A",
                    symbol: row[2] || "N/A",
                    htf: row[4] || "N/A",
                    magic: row[3] || "0",
                    profit: row[10] || "0",
                    status: row[16] || "ACTIVE", // Column Q
                };
            })
            .filter((item: any) => item.status !== "DELETED");

        // Parseo y Ordenamiento (Descending) con validación segura
        data.sort((a: any, b: any) => {
            const parseDate = (dateStr: string) => {
                try {
                    if (!dateStr || typeof dateStr !== 'string' || dateStr.trim() === "" || dateStr === "N/A") return 0;
                    const parts = dateStr.split(' ');
                    if (parts.length < 2) return 0;

                    const datePart = parts[0];
                    const timePart = parts[1];
                    const dateParts = datePart.split('.');
                    const timeParts = timePart.split(':');

                    if (dateParts.length !== 3 || timeParts.length < 2) return 0;

                    const [year, month, day] = dateParts;
                    const [hour, minute, second = "0"] = timeParts;

                    const time = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second)).getTime();
                    return isNaN(time) ? 0 : time;
                } catch (error) {
                    return 0; // Fecha de respaldo segura (equivale a 1/1/1970, o bien mandarlo al final)
                }
            };
            return parseDate(b.time) - parseDate(a.time);
        });

        // Formateo de Salida Seguro
        data.forEach((item: any) => {
            try {
                if (!item.time || typeof item.time !== 'string' || item.time.trim() === "" || item.time === "N/A") {
                    item.time = "Fecha Inválida";
                    return;
                }

                const parts = item.time.split(' ');
                if (parts.length >= 2) {
                    const datePart = parts[0];
                    const timePart = parts[1];
                    const dateParts = datePart.split('.');

                    if (dateParts.length === 3) {
                        const [year, month, day] = dateParts;
                        item.time = `${day}/${month}/${year} ${timePart}`;
                    } else {
                        item.time = "Fecha Inválida";
                    }
                } else {
                    item.time = "Fecha Inválida";
                }
            } catch (error) {
                item.time = "Fecha Inválida";
            }
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
        if (valuesToUpdate.time !== undefined) {
            data.push({
                range: `${SHEET_NAME}!B${row}`,
                values: [[valuesToUpdate.time]],
            });
        }
        if (valuesToUpdate.symbol !== undefined) {
            data.push({
                range: `${SHEET_NAME}!C${row}`,
                values: [[valuesToUpdate.symbol]],
            });
        }
        if (valuesToUpdate.htf !== undefined) {
            data.push({
                range: `${SHEET_NAME}!E${row}`,
                values: [[valuesToUpdate.htf]],
            });
        }
        if (valuesToUpdate.magic !== undefined) {
            data.push({
                range: `${SHEET_NAME}!D${row}`,
                values: [[valuesToUpdate.magic]],
            });
        }
        if (valuesToUpdate.profit !== undefined) {
            data.push({
                range: `${SHEET_NAME}!K${row}`,
                values: [[valuesToUpdate.profit]],
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
