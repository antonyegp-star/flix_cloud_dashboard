import TradingDataTable from "@/components/TradingDataTable";
import LookerStudioEmbed from "@/components/LookerStudioEmbed";

// Placeholder, instruct user to replace via DEPLOYMENT.md
const LOOKER_URL = process.env.NEXT_PUBLIC_LOOKER_URL || "";

export default function Home() {
    return (
        <main className="min-h-screen bg-background text-foreground p-6 md:p-12 font-sans selection:bg-primary selection:text-primary-foreground">
            <div className="max-w-7xl mx-auto space-y-12">

                {/* Header */}
                <header className="border-b border-border pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-gray-100 to-gray-500 bg-clip-text text-transparent">
                            Flix Cloud Dashboard
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Institutional Trading Data Layer & Analytics Visualization
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1 bg-green-900/30 border border-green-500/50 text-green-400 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Data Sync Active
                        </div>
                        <div className="px-3 py-1 bg-destructive/10 border border-destructive/50 text-destructive rounded-full text-xs font-semibold uppercase tracking-wider">
                            No MT5 Execution
                        </div>
                    </div>
                </header>

                {/* Looker Studio Data Visualization */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-bold">Visual Analytics</h2>
                        <div className="h-px bg-border flex-1 ml-4 hidden sm:block"></div>
                    </div>
                    <LookerStudioEmbed embedUrl={LOOKER_URL} />
                </section>

                {/* Master Data Editor */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-bold">Historial de Operaciones (Flix_Data_Master)</h2>
                        <div className="h-px bg-border flex-1 ml-4 hidden sm:block"></div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Gestión en tiempo real de los datos sincronizados. Los cambios aplicados aquí se reflejarán bidireccionalmente en la Hoja de Cálculo.
                    </p>
                    <TradingDataTable />
                </section>

            </div>
        </main>
    );
}
