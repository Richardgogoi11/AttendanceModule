import { useEffect } from 'react';
import { Camera, RotateCcw } from 'lucide-react';
import { useCamera } from '../hooks/useCamera';
import { cn } from '../utils/utils';

export const CameraCapture = ({ onCapture, onClear }) => {
    const {
        videoRef,
        canvasRef,
        stream,
        error,
        imageSrc,
        startCamera,
        takeSnapshot,
        retakePhoto,
        clearPhoto
    } = useCamera();

    const handleSnapshot = () => {
        const photo = takeSnapshot();
        if (photo) onCapture(photo);
    };

    const handleRetake = () => {
        retakePhoto();
        onClear();
    };

    return (
        <div className="flex flex-col items-center justify-center w-full my-4">
            {error && (
                <div className="p-3 mb-4 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20" role="alert">
                    {error}
                </div>
            )}

            <div className="relative w-full max-w-sm aspect-video bg-secondary/50 rounded-xl overflow-hidden shadow-sm border border-border flex flex-col justify-center items-center group">
                {!imageSrc ? (
                    <>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className={cn("object-cover w-full h-full", stream ? 'block' : 'hidden')}
                        />
                        {!stream && !error && (
                            <button
                                type="button"
                                onClick={startCamera}
                                className="flex flex-col items-center justify-center w-full h-full text-muted-foreground hover:text-foreground hover:bg-secondary/30 transition-colors cursor-pointer"
                            >
                                <Camera className="w-10 h-10 mb-3 opacity-80" strokeWidth={1.5} />
                                <span className="text-sm font-medium tracking-tight">Tap to Start Camera</span>
                            </button>
                        )}
                        {/* Overlay when active */}
                        {stream && (
                            <div className="absolute inset-x-0 bottom-0 top-1/2 bg-linear-to-t from-black/60 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                    </>
                ) : (
                    <img src={imageSrc} alt="Snapshot" className="object-cover w-full h-full" />
                )}
            </div>

            <canvas ref={canvasRef} className="hidden" />

            <div className="mt-5 flex gap-3">
                {!imageSrc && stream && (
                    <button
                        type="button"
                        onClick={handleSnapshot}
                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-all active:scale-95 shadow-sm cursor-pointer"
                    >
                        <Camera className="w-4 h-4 fill-current opacity-80" />
                        Take Photo
                    </button>
                )}

                {imageSrc && (
                    <button
                        type="button"
                        onClick={handleRetake}
                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-foreground bg-secondary rounded-md hover:bg-secondary/80 border border-border transition-all active:scale-95 shadow-sm cursor-pointer"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Retake
                    </button>
                )}
            </div>
        </div>
    );
};
