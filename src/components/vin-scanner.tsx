"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Check, ImagePlus, RotateCcw, ScanLine, Type, X } from "lucide-react";

import { extractVin } from "@/lib/vin";

type Detector = { detect: (source: CanvasImageSource) => Promise<Array<{ rawValue: string }>> };
type DetectorConstructor = new (options: { formats: string[] }) => Detector;

const barcodeFormats = ["code_39", "code_128", "qr_code", "data_matrix", "pdf417"];
// The yellow guide box, as fractions of the visible camera frame (matches the CSS).
const guide = { left: 0.08, top: 0.38, width: 0.84, height: 0.24 };

function nativeDetector(): Detector | null {
  const NativeDetector = (window as unknown as { BarcodeDetector?: DetectorConstructor }).BarcodeDetector;
  return NativeDetector ? new NativeDetector({ formats: barcodeFormats }) : null;
}

async function zxingReader() {
  const [{ BrowserMultiFormatReader }, { BarcodeFormat, DecodeHintType }] = await Promise.all([import("@zxing/browser"), import("@zxing/library")]);
  const hints = new Map();
  hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.CODE_39, BarcodeFormat.CODE_128, BarcodeFormat.QR_CODE, BarcodeFormat.DATA_MATRIX, BarcodeFormat.PDF_417]);
  hints.set(DecodeHintType.TRY_HARDER, true);
  return new BrowserMultiFormatReader(hints);
}

// Grayscale + contrast stretch + upscale: OCR reads small label print far better.
function prepareForOcr(source: CanvasImageSource, sx: number, sy: number, sw: number, sh: number) {
  const scale = Math.max(1, Math.min(3, 1600 / sw));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(sw * scale);
  canvas.height = Math.round(sh * scale);
  const context = canvas.getContext("2d", { willReadFrequently: true })!;
  context.imageSmoothingQuality = "high";
  context.drawImage(source, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  const image = context.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = image.data;
  let low = 255;
  let high = 0;
  for (let index = 0; index < pixels.length; index += 4) {
    const gray = 0.299 * pixels[index] + 0.587 * pixels[index + 1] + 0.114 * pixels[index + 2];
    pixels[index] = gray;
    if (gray < low) low = gray;
    if (gray > high) high = gray;
  }
  const range = Math.max(1, high - low);
  for (let index = 0; index < pixels.length; index += 4) {
    const stretched = ((pixels[index] - low) / range) * 255;
    pixels[index] = pixels[index + 1] = pixels[index + 2] = stretched;
  }
  context.putImageData(image, 0, 0);
  return canvas;
}

async function readText(canvas: HTMLCanvasElement, singleLine: boolean) {
  const { createWorker, PSM } = await import("tesseract.js");
  const worker = await createWorker("eng");
  await worker.setParameters({
    tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ",
    tessedit_pageseg_mode: singleLine ? PSM.SINGLE_LINE : PSM.AUTO
  });
  const { data } = await worker.recognize(canvas);
  await worker.terminate();
  return data.text;
}

// Camera VIN capture. Barcodes (door-jamb Code 39 / QR / Data Matrix) are trusted
// and applied straight away; text read by OCR is shown for confirmation first.
export function VinScanner({ onVin, onClose }: { onVin: (vin: string) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [status, setStatus] = useState("Starting camera...");
  const [busy, setBusy] = useState(false);
  const [candidate, setCandidate] = useState("");
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let stopped = false;
    let timer = 0;
    let zxingControls: { stop: () => void } | null = null;

    function found(vin: string) {
      if (stopped) return;
      stopped = true;
      onVin(vin);
    }

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus("Live camera isn't available here. Use Take photo below.");
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false });
      } catch {
        setStatus("Camera permission was blocked. Allow the camera for this site, or use Take photo below.");
        return;
      }
      const video = videoRef.current;
      if (!video || stopped) return;
      video.srcObject = stream;
      await video.play().catch(() => undefined);
      setCameraReady(true);
      setStatus("Hold the VIN barcode (driver door jamb) inside the yellow box, about 6-10 inches away.");

      const detector = nativeDetector();
      if (detector) {
        const tick = async () => {
          if (stopped) return;
          try {
            for (const code of await detector.detect(video)) {
              const vin = extractVin(code.rawValue);
              if (vin) return found(vin);
            }
          } catch { /* frame not ready */ }
          timer = window.setTimeout(tick, 200);
        };
        void tick();
        return;
      }
      const reader = await zxingReader();
      if (stopped) return;
      zxingControls = await reader.decodeFromVideoElement(video, (result) => {
        const vin = result ? extractVin(result.getText()) : null;
        if (vin) found(vin);
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

  // Map the on-screen guide box (video uses object-fit: cover) to source pixels.
  function guideRegion(video: HTMLVideoElement) {
    const displayW = video.clientWidth || video.videoWidth;
    const displayH = video.clientHeight || video.videoHeight;
    const scale = Math.max(displayW / video.videoWidth, displayH / video.videoHeight);
    const offsetX = (video.videoWidth * scale - displayW) / 2;
    const offsetY = (video.videoHeight * scale - displayH) / 2;
    return {
      sx: (guide.left * displayW + offsetX) / scale,
      sy: (guide.top * displayH + offsetY) / scale,
      sw: (guide.width * displayW) / scale,
      sh: (guide.height * displayH) / scale
    };
  }

  async function readPrintedVin() {
    const video = videoRef.current;
    if (!video?.videoWidth) return;
    setBusy(true);
    setCandidate("");
    setStatus("Reading the text in the yellow box... hold steady.");
    try {
      const { sx, sy, sw, sh } = guideRegion(video);
      const vin = extractVin(await readText(prepareForOcr(video, sx, sy, sw, sh), true));
      if (vin) {
        setCandidate(vin);
        setStatus("Check this against the vehicle before using it.");
      } else {
        setStatus("No valid VIN in the box. Fill the box with just the VIN line, avoid glare, and try again.");
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Text reading failed.");
    } finally {
      setBusy(false);
    }
  }

  // Native camera photo: sharper focus than a live preview, then barcode first, OCR second.
  async function readPhoto(file: File | null) {
    if (!file) return;
    setBusy(true);
    setCandidate("");
    setStatus("Reading the photo...");
    try {
      const bitmap = await createImageBitmap(file);
      const detector = nativeDetector();
      if (detector) {
        for (const code of await detector.detect(bitmap)) {
          const vin = extractVin(code.rawValue);
          if (vin) { bitmap.close(); onVin(vin); return; }
        }
      } else {
        const url = URL.createObjectURL(file);
        try {
          const result = await (await zxingReader()).decodeFromImageUrl(url);
          const vin = extractVin(result.getText());
          if (vin) { bitmap.close(); onVin(vin); return; }
        } catch { /* no barcode found - fall through to OCR */ } finally {
          URL.revokeObjectURL(url);
        }
      }
      setStatus("No barcode found - reading the printed text...");
      const vin = extractVin(await readText(prepareForOcr(bitmap, 0, 0, bitmap.width, bitmap.height), false));
      bitmap.close();
      if (vin) {
        setCandidate(vin);
        setStatus("Check this against the vehicle before using it.");
      } else {
        setStatus("Couldn't find a valid VIN in that photo. Get closer so the VIN or its barcode fills most of the picture.");
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Couldn't read that photo.");
    } finally {
      setBusy(false);
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
        {candidate ? (
          <div className="vin-candidate">
            <span>Read:</span>
            <strong>{candidate}</strong>
            <button className="primary-button" onClick={() => onVin(candidate)}><Check size={15} /> Use this VIN</button>
            <button className="secondary-button" onClick={() => { setCandidate(""); setStatus("Try again."); }}><RotateCcw size={15} /> Retry</button>
          </div>
        ) : null}
        <div className="service-decision-grid">
          <button className="secondary-button" disabled={busy || !cameraReady} onClick={readPrintedVin}><Type size={16} /> {busy ? "Reading..." : "Read printed VIN in box"}</button>
          <label className="secondary-button vehicle-photo-upload"><ImagePlus size={16} /> Take photo instead<input type="file" accept="image/*" capture="environment" onChange={(event) => { void readPhoto(event.target.files?.[0] ?? null); event.target.value = ""; }} /></label>
          <button className="secondary-button" onClick={onClose}><Camera size={16} /> Cancel</button>
        </div>
      </div>
    </div>
  );
}
