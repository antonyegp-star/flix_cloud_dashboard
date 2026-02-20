export default function LookerStudioEmbed({ embedUrl }: { embedUrl: string }) {
    return (
        <div className="w-full relative rounded-lg border border-border overflow-hidden bg-muted shadow-2xl">
            <div className="bg-secondary px-4 py-2 border-b border-border flex items-center justify-between">
                <h3 className="text-sm font-semibold text-primary">Flix Looker Studio Report</h3>
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
            </div>
            <div className="relative w-full pt-[56.25%] lg:pt-[45%]">
                {/* 16:9 Aspect Ratio by default, slightly shorter on large screens */}
                {embedUrl ? (
                    <iframe
                        src={embedUrl}
                        frameBorder="0"
                        allowFullScreen
                        sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                        className="absolute top-0 left-0 w-full h-full"
                        style={{ border: 0 }}
                    ></iframe>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground text-center px-6">
                        <p className="text-lg font-bold mb-2 text-primary">Looker Studio no configurado</p>
                        <p className="max-w-md">
                            Añade tu URL de inserción en el archivo `page.tsx` (variable LOOKER_URL).
                            Asegúrate de permitir la incrustación desde Looker Studio.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
