import { useRef, useState, useCallback } from "react";

interface Props {
  onCapture: (dataUrl: string) => void;
}

export function WebcamCapture({ onCapture }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setActive(true);
      setError(null);
    } catch {
      setError("Camera access denied or not available");
    }
  }

  const capture = useCallback(() => {
    const video = videoRef.current!;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")!.drawImage(video, 0, 0);
    const url = canvas.toDataURL("image/jpeg", 0.7);
    setPreview(url);
    onCapture(url);
    (video.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
    setActive(false);
  }, [onCapture]);

  function retake() {
    setPreview(null);
    onCapture("");
  }

  return (
    <div className="flex flex-col gap-2">
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {!active && !preview && (
        <button type="button" onClick={startCamera} className="btn-secondary w-fit">
          Open Camera
        </button>
      )}
      {active && (
        <div className="flex flex-col gap-2">
          <video ref={videoRef} className="w-48 rounded border" />
          <button type="button" onClick={capture} className="btn-primary w-fit">
            Take Photo
          </button>
        </div>
      )}
      {preview && (
        <div className="flex items-center gap-3">
          <img src={preview} alt="Visitor" className="w-20 h-20 rounded object-cover border" />
          <button type="button" onClick={retake} className="text-sm text-blue-600 hover:underline">
            Retake
          </button>
        </div>
      )}
    </div>
  );
}
