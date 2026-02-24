"use client";

import { useState, useEffect } from "react";
import { TradeRecord } from "@/types";
import { Loader2, Trash2, Edit2, Check, X, EyeOff, Eye } from "lucide-react";

export default function TradingDataTable() {
    const [data, setData] = useState<TradeRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingRow, setEditingRow] = useState<number | null>(null);
    const [editValues, setEditValues] = useState<Partial<TradeRecord>>({});

    // Command Center States
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [statusLoading, setStatusLoading] = useState(false);

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

    const handleStatusChange = async (action: "DELETED" | "ACTIVE") => {
        if (!startDate || !endDate) {
            alert("Por favor selecciona ambas fechas (Desde y Hasta).");
            return;
        }

        try {
            setStatusLoading(true);
            const res = await fetch("/api/trades/status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ startDate, endDate, action }),
            });

            const currentData = await res.json();

            if (!res.ok) {
                alert(`Error: ${currentData.error || 'Algo salió mal'}`);
            } else {
                alert(`¡Completado! Se afectaron ${currentData.updatedCount} operaciones.`);
                fetchData();
            }
        } catch (e: any) {
            console.error(e);
            alert(`Error: ${e.message}`);
        } finally {
            setStatusLoading(false);
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
        <div className="space-y-4">
            {/* Command Center Panel */}
            <div className="p-4 rounded-lg border border-border bg-card text-card-foreground shadow-sm">
                <h3 className="text-lg font-semibold mb-4 text-primary">Centro de Comando: Ocultar/Recuperar</h3>
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Desde</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                    <div className="flex-1 space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Hasta</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>

                    <div className="flex gap-2 mt-4 md:mt-0">
                        <button
                            onClick={() => handleStatusChange("DELETED")}
                            disabled={statusLoading}
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2"
                        >
                            {statusLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <EyeOff className="w-4 h-4 mr-2" />}
                            Ocultar Rango
                        </button>
                        <button
                            onClick={() => handleStatusChange("ACTIVE")}
                            disabled={statusLoading}
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-green-600 text-white hover:bg-green-700 h-10 px-4 py-2"
                        >
                            {statusLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Eye className="w-4 h-4 mr-2" />}
                            Recuperar Rango
                        </button>
                    </div>
                </div>
            </div>

            {/* Trading Data Table */}
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
        </div>
    );
}
