export interface TradeRecord {
    row: number; // The row number in Google Sheets
    time: string;
    symbol: string;
    htf: string;
    magic: string;
    profit: string;
    [key: string]: string | number;
}
