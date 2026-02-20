export interface TradeRecord {
    row: number; // The row number in Google Sheets
    magic: string;
    symbol: string;
    profit: string;
    mae: string;
    exitReason: string;
    [key: string]: string | number;
}
