"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, ScanLine, Type, X } from "lucide-react";

import { extractVin } from "@/lib/vin";

type Detector = { detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue: string }>> };
type DetectorConstructor = new (options: { formats: string[] }) => Detector;

const barcodeFormats = ["code_39", "code_128", "qr_code", "data_matrix", "pdf417"];

// Camera VIN capture: reads the door-jamb barcode / QR / Data Matrix, or the
// printed VIN text (windshield plate, registration) on request. Only a VIN with a
// valid check digit is accepted.
export function VinScanner({ onVin, onClose }: { onVin: (vin: string) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [status, setStatus] = useState("Starting camera...");
  const [reading, setReading] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let stopped = false;
    let timer = 0;
    let zxingControls: { stop: () => void } | null = null;

    function finish(vin: string) {
      if (stopped) return;
      stopped = true;
      onVin(vin);
    }

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus("This browser can't open the camera. Use https (or localhost) and allow camera access.");
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false });
      } catch {
        setStatus("Camera permission was blocked. Allow the camera for this site and try again.");
        return;
      }
      const video = videoRef.current;
      if (!video || stopped) return;
      video.srcObject = stream;
      await video.play().catch(() => undefined);
      setStatus("Point at the VIN barcode on the door jamb (or tap Read printed VIN).");

      const NativeDetector = (window as unknown as { BarcodeDetector?: DetectorConstructor }).BarcodeDetector;
      if (NativeDetector) {
        // Chrome/Android: built-in detector, scanned a few times a second.
        const detector = new NativeDetector({ formats: barcodeFormats });
        const tick = async () => {
          if (stopped) return;
          try {
            for (const code of await detector.detect(video)) {
              const vin = extractVin(code.rawValue);
              if (vin) return finish(vin);
            }
          } catch { /* frame not ready */ }
          timer = window.setTimeout(tick, 250);
        };
        void tick();
        return;
      }

      // Safari/iOS and others: ZXing decoder on the same video element.
      const [{ BrowserMultiFormatReader }, { BarcodeFormat, DecodeHintType }] = await Promise.all([import("@zxing/browser"), import("@zxing/library")]);
      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.CODE_39, BarcodeFormat.CODE_128, BarcodeFormat.QR_CODE, BarcodeFormat.DATA_MATRIX, BarcodeFormat.PDF_417]);
      hints.set(DecodeHintType.TRY_HARDER, true);
      const reader = new BrowserMultiFormatReader(hints);
      if (stopped) return;
      zxingControls = await reader.decodeFromVideoElement(video, (result) => {
        const vin = result ? extractVin(result.getText()) : null;
        if (vin) finish(vin);
      });
    }

    void start();
    return () => {
      stopped = true;
      window.clearTimeout(timer);
      zxingControls?.stop();
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [onVin]);

  async function readPrintedVin() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    setReading(true);
    setStatus("Reading printed text... hold steady.");
    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d")?.drawImage(video, 0, 0);
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("eng");
      await worker.setParameters({ tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789" });
      const { data } = await worker.recognize(canvas);
      await worker.terminate();
      const vin = extractVin(data.text);
      if (vin) onVin(vin);
      else setStatus("Couldn't read a valid VIN. Fill the frame with just the VIN, avoid glare, and try again.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Text reading failed.");
    } finally {
      setReading(false);
    }
  }

  return (
    <div className="vin-scanner-overlay" role="dialog" aria-label="Scan VIN">
      <div className="vin-scanner">
        <div className="panel-title">
          <h2><ScanLine size={18} /> Scan VIN</h2>
          <button className="icon-button" aria-label="Close scanner" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="vin-scanner-frame">
          <video ref={videoRef} playsInline muted />
          <div className="vin-scanner-guide" />
        </div>
        <p className="legal-note">{status}</p>
        <div className="service-decision-grid">
          <button className="secondary-button" disabled={reading} onClick={readPrintedVin}><Type size={16} /> {reading ? "Reading..." : "Read printed VIN"}</button>
          <button className="secondary-button" onClick={onClose}><Camera size={16} /> Cancel</button>
        </div>
      </div>
    </div>
  );
}
