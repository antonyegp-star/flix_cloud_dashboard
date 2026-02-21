"use client";

import { useState, useEffect } from "react";
import { TradeRecord } from "@/types";
import { Loader2, Trash2, Edit2, Check, X } from "lucide-react";

export default function TradingDataTable() {
    const [data, setData] = useState<TradeRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingRow, setEditingRow] = useState<number | null>(null);
    const [editValues, setEditValues] = useState<Partial<TradeRecord>>({});

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/trades");
            const json = await res.json();
            setData(json.data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000); // Poll every minute
        return () => clearInterval(interval);
    }, []);

    const handleDelete = async (row: number) => {
        if (!confirm("¿Eliminar este registro permanentemente de Google Sheets?")) return;
        try {
            await fetch("/api/trades", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ row }),
            });
            fetchData();
        } catch (e) {
            console.error(e);
        }
    };

    const handleEdit = (record: TradeRecord) => {
        setEditingRow(record.row);
        setEditValues({
            time: record.time,
            symbol: record.symbol,
            htf: record.htf,
            magic: record.magic,
            profit: record.profit,
        });
    };

    const cancelEdit = () => {
        setEditingRow(null);
        setEditValues({});
    };

    const confirmEdit = async (row: number) => {
        try {
            await fetch("/api/trades", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                // Simulate sending mapped values based on the simplified API route logic we created
                body: JSON.stringify({
                    row,
                    valuesToUpdate: {
                        time: editValues.time,
                        symbol: editValues.symbol,
                        htf: editValues.htf,
                        magic: editValues.magic,
                        profit: editValues.profit,
                    }
                }),
            });
            setEditingRow(null);
            fetchData();
        } catch (e) {
            console.error(e);
        }
    };

    if (loading && data.length === 0) {
        return (
            <div className="flex justify-center items-center h-48 border border-border rounded-lg bg-card text-card-foreground">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-3 font-medium text-lg">Cargando datos institucionales...</span>
            </div>
        );
    }

    return (
        <div className="rounded-lg border border-border bg-card overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted text-muted-foreground uppercase text-xs font-semibold">
                        <tr>
                            <th className="px-6 py-4">Fecha</th>
                            <th className="px-6 py-4">Símbolo</th>
                            <th className="px-6 py-4">HTF</th>
                            <th className="px-6 py-4">Magia</th>
                            <th className="px-6 py-4">Ganancia</th>
                            <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((record) => {
                            const isEditing = editingRow === record.row;
                            return (
                                <tr
                                    key={record.row}
                                    className="border-b border-border hover:bg-muted/50 transition-colors"
                                >
                                    <td className="px-6 py-4 text-primary font-medium">
                                        {isEditing ? (
                                            <input
                                                className="bg-background border border-border rounded p-1 w-32"
                                                value={editValues.time || ""}
                                                onChange={(e) => setEditValues({ ...editValues, time: e.target.value })}
                                            />
                                        ) : (
                                            record.time
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {isEditing ? (
                                            <input
                                                className="bg-background border border-border rounded p-1 w-24"
                                                value={editValues.symbol || ""}
                                                onChange={(e) => setEditValues({ ...editValues, symbol: e.target.value })}
                                            />
                                        ) : (
                                            <span className="bg-secondary px-2 py-1 rounded text-xs font-semibold">
                                                {record.symbol}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {isEditing ? (
                                            <input
                                                className="bg-background border border-border rounded p-1 w-24"
                                                value={editValues.htf || ""}
                                                onChange={(e) => setEditValues({ ...editValues, htf: e.target.value })}
                                            />
                                        ) : (
                                            record.htf
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {isEditing ? (
                                            <input
                                                className="bg-background border border-border rounded p-1 w-24"
                                                value={editValues.magic || ""}
                                                onChange={(e) => setEditValues({ ...editValues, magic: e.target.value })}
                                            />
                                        ) : (
                                            record.magic
                                        )}
                                    </td>
                                    <td className={`px-6 py-4 font-bold ${typeof record.profit === "string" && record.profit.includes("-")
                                        ? "text-destructive"
                                        : "text-green-500"
                                        }`}>
                                        {isEditing ? (
                                            <input
                                                className="bg-background border border-border rounded p-1 w-24 font-normal text-foreground"
                                                value={editValues.profit || ""}
                                                onChange={(e) => setEditValues({ ...editValues, profit: e.target.value })}
                                            />
                                        ) : (
                                            record.profit
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {isEditing ? (
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => confirmEdit(record.row)}
                                                    className="p-1.5 bg-green-900/40 text-green-500 rounded hover:bg-green-900/60 transition-colors"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={cancelEdit}
                                                    className="p-1.5 bg-destructive/20 text-destructive rounded hover:bg-destructive/40 transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(record)}
                                                    className="p-1.5 bg-secondary text-primary rounded hover:bg-secondary/80 transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(record.row)}
                                                    className="p-1.5 bg-destructive/10 text-destructive rounded hover:bg-destructive/20 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        {data.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                    No hay operaciones registradas.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
