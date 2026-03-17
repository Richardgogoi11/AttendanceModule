import { useState, useRef, useEffect, useCallback } from 'react';

export const useCamera = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [error, setError] = useState(null);
    const [imageSrc, setImageSrc] = useState(null);

    const startCamera = useCallback(async () => {
        try {
            setError(null);
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' },
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            setError('Unable to access camera. Please check permissions.');
            console.error('Camera access error:', err);
        }
    }, []);

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
        }
    }, [stream]);

    useEffect(() => {
        // Cleanup stream on dismount
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    const takeSnapshot = useCallback(() => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const context = canvas.getContext('2d');
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageData = canvas.toDataURL('image/jpeg', 0.8);
            setImageSrc(imageData);
            stopCamera();
            return imageData;
        }
        return null;
    }, [stopCamera]);

    const retakePhoto = useCallback(() => {
        setImageSrc(null);
        startCamera();
    }, [startCamera]);

    const clearPhoto = useCallback(() => {
        setImageSrc(null);
    }, []);

    return {
        videoRef,
        canvasRef,
        stream,
        error,
        imageSrc,
        startCamera,
        stopCamera,
        takeSnapshot,
        retakePhoto,
        clearPhoto
    };
};
