import { google } from "googleapis";

export async function getGoogleSheetsClient() {
    const scopes = ["https://www.googleapis.com/auth/spreadsheets"];

    // Environment variables are preferred in production (Vercel)
    // For local DEV with service_account.json:
    let auth;
    if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
        auth = new google.auth.JWT({
            email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
            scopes,
        });
    } else {
        try {
            // Fallback for local testing if file exists in project root
            auth = new google.auth.GoogleAuth({
                keyFile: "./service_account.json",
                scopes,
            });
        } catch (e) {
            throw new Error("Missing Google Service Account credentials.");
        }
    }

    const sheets = google.sheets({ version: "v4", auth });
    return sheets;
}

export const SPREADSHEET_ID = process.env.NEXT_PUBLIC_SPREADSHEET_ID || ""; // Ensure this is set in .env
export const SHEET_NAME = "Flix_Data_Master";
