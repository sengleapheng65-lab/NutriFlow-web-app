import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BrowserMultiFormatOneDReader, type IScannerControls } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";

import { createMeal, getFoodByBarcode } from "../services/mealApi";

import "../styles/AddMeal.css";

type ScannerDetector = {
  detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue?: string }>>;
};

type ScannerWindow = Window & {
  BarcodeDetector?: new (options?: {
    formats?: string[];
  }) => ScannerDetector;
};

function AddMeal() {
  const navigate = useNavigate();

  // Store the form values
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [barcode, setBarcode] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanStatus, setScanStatus] = useState("");
  const [isLookingUpBarcode, setIsLookingUpBarcode] = useState(false);

  const scannerVideoRef = useRef<HTMLVideoElement>(null);
  const scannerStreamRef = useRef<MediaStream | null>(null);
  const scannerControlsRef = useRef<IScannerControls | null>(null);
  const scanningRef = useRef(false);
  const scanInProgressRef = useRef(false);
  const scanTimerRef = useRef<number | null>(null);
  const scannerTrackRef = useRef<MediaStreamTrack | null>(null);
  const scannerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [zoomSupported, setZoomSupported] = useState(false);
  const [zoom, setZoom] = useState(1);

  // Track the backend request
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => stopScanner();
  }, []);

  function stopScanner() {
    scanningRef.current = false;
    scanInProgressRef.current = false;
    if (scanTimerRef.current !== null) {
      window.clearTimeout(scanTimerRef.current);
      scanTimerRef.current = null;
    }
    scannerControlsRef.current?.stop();
    scannerControlsRef.current = null;
    scannerTrackRef.current = null;
    scannerCanvasRef.current = null;
    scannerStreamRef.current?.getTracks().forEach((track) => track.stop());
    scannerStreamRef.current = null;
    setTorchSupported(false);
    setTorchOn(false);
    setZoomSupported(false);
    setZoom(1);

    if (scannerVideoRef.current) {
      scannerVideoRef.current.srcObject = null;
    }

    setScannerOpen(false);
  }

  async function applyBarcode(value: string) {
    const trimmedBarcode = value.trim();

    if (!trimmedBarcode) {
      setScanStatus("Enter a barcode to continue.");
      return;
    }

    setBarcode(trimmedBarcode);
    stopScanner();
    setIsLookingUpBarcode(true);
    setScanStatus("Looking up product nutrition…");

    try {
      const food = await getFoodByBarcode(trimmedBarcode);

      setName(food.name || `Product barcode: ${trimmedBarcode}`);
      setCalories(String(Math.round(Number(food.calories) || 0)));
      setProtein(String(Number(food.protein) || 0));
      setCarbs(String(Number(food.carbs) || 0));
      setFat(String(Number(food.fat) || 0));

      const nutritionBasis = food.nutritionBasis || "per 100 g";
      const servingNote = food.servingSize
        ? ` Values are ${nutritionBasis}; package serving: ${food.servingSize}.`
        : ` Values are ${nutritionBasis}.`;
      setScanStatus(`Calories, protein, carbohydrates, and fat were added to Meal Details.${servingNote}`);
    } catch {
      setName((currentName) => currentName || `Product barcode: ${trimmedBarcode}`);
      setScanStatus("Could not find nutrition data. Enter the package label values manually.");
    } finally {
      setIsLookingUpBarcode(false);
    }
  }

  async function startScanner() {
    const detectorConstructor = (window as ScannerWindow).BarcodeDetector;

    if (!navigator.mediaDevices?.getUserMedia) {
      setScanStatus("Camera access is unavailable. Enter the barcode manually below.");
      return;
    }

    try {
      setScanStatus(
        detectorConstructor
          ? "Point your camera at a product barcode."
          : "Using Safari-compatible barcode scanning. Point your camera at a barcode.",
      );
      setScannerOpen(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30, max: 30 },
        },
      });

      scannerStreamRef.current = stream;
      const track = stream.getVideoTracks()[0];
      scannerTrackRef.current = track;
      const capabilities = track.getCapabilities();
      setTorchSupported("torch" in capabilities && Boolean(capabilities.torch));
      setZoomSupported("zoom" in capabilities);
      if ("focusMode" in capabilities) {
        await track.applyConstraints({
          advanced: [{ focusMode: "continuous" }],
        } as unknown as MediaTrackConstraints);
      }
      scanningRef.current = true;

      const video = scannerVideoRef.current;
      if (!video) {
        stopScanner();
        return;
      }

      video.srcObject = stream;
      await video.play();

      if (!detectorConstructor) {
        const hints = new Map<DecodeHintType, BarcodeFormat[]>();
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [
          BarcodeFormat.EAN_13,
          BarcodeFormat.EAN_8,
          BarcodeFormat.UPC_A,
          BarcodeFormat.UPC_E,
          BarcodeFormat.CODE_128,
        ]);
        const reader = new BrowserMultiFormatOneDReader(hints, {
          delayBetweenScanAttempts: 150,
        });
        const canvas = document.createElement("canvas");
        scannerCanvasRef.current = canvas;

        const scanWithZxing = () => {
          if (!scanningRef.current || !scannerVideoRef.current) return;

          const sourceVideo = scannerVideoRef.current;
          const sourceWidth = sourceVideo.videoWidth;
          const sourceHeight = sourceVideo.videoHeight;
          if (!sourceWidth || !sourceHeight) {
            scanTimerRef.current = window.setTimeout(scanWithZxing, 150);
            return;
          }

          // Short barcodes occupy fewer pixels on an iPhone preview. Scan a
          // larger region than the guide and render it at 2x so ZXing has a
          // clearer image to work with, especially on Safari.
          const cropWidth = Math.floor(sourceWidth * 0.92);
          const cropHeight = Math.floor(sourceHeight * 0.7);
          const cropX = Math.floor((sourceWidth - cropWidth) / 2);
          const cropY = Math.floor((sourceHeight - cropHeight) / 2);
          const renderScale = 2;
          canvas.width = cropWidth * renderScale;
          canvas.height = cropHeight * renderScale;

          const context = canvas.getContext("2d", { willReadFrequently: true });
          if (!context) return;
          context.drawImage(
            sourceVideo,
            cropX,
            cropY,
            cropWidth,
            cropHeight,
            0,
            0,
            canvas.width,
            canvas.height,
          );

          try {
            const result = reader.decodeFromCanvas(canvas);
            scanningRef.current = false;
            void applyBarcode(result.getText());
            return;
          } catch {
            // Not every frame contains a decodable barcode.
          }

          scanTimerRef.current = window.setTimeout(scanWithZxing, 150);
        };

        scanWithZxing();
        return;
      }

      const detector = new detectorConstructor({
        formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128"],
      });

      const scanFrame = async () => {
        if (!scanningRef.current || !scannerVideoRef.current) return;

        if (scanInProgressRef.current) {
          scanTimerRef.current = window.setTimeout(scanFrame, 150);
          return;
        }

        scanInProgressRef.current = true;
        try {
          const results = await detector.detect(scannerVideoRef.current);
          const result = results.find((item) => item.rawValue)?.rawValue;

          if (result) {
            applyBarcode(result);
            return;
          }
        } catch {
          // Keep checking frames while camera autofocus settles.
        } finally {
          scanInProgressRef.current = false;
        }

        if (scanningRef.current) {
          scanTimerRef.current = window.setTimeout(scanFrame, 150);
        }
      };

      void scanFrame();
    } catch {
      stopScanner();
      setScanStatus("Camera access was denied or unavailable. Enter the barcode manually below.");
    }
  }

  async function toggleTorch() {
    const track = scannerTrackRef.current;
    if (!track || !torchSupported) return;

    const nextTorchState = !torchOn;
    try {
      await track.applyConstraints({
        advanced: [{ torch: nextTorchState }],
      } as unknown as MediaTrackConstraints);
      setTorchOn(nextTorchState);
    } catch {
      setScanStatus("This camera could not change its light setting.");
    }
  }

  async function changeZoom(value: number) {
    const track = scannerTrackRef.current;
    if (!track || !zoomSupported) return;

    try {
      await track.applyConstraints({
        advanced: [{ zoom: value }],
      } as unknown as MediaTrackConstraints);
      setZoom(value);
    } catch {
      setScanStatus("This camera could not change its zoom.");
    }
  }

  // Send the new meal to the Spring Boot backend
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSaving(true);
    setError("");

    try {
      // POST the meal to /api/meals
      await createMeal({
        name: name.trim(),
        calories: Number(calories),
        protein: Number(protein),
        carbs: Number(carbs),
        fat: Number(fat),
      });

      // Return to the Dashboard after saving
      navigate("/dashboard");
    } catch (requestError) {
      console.error(requestError);

      setError(
        "Could not save the meal. Make sure the Spring Boot backend is running.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="add-meal-main">
      {/* Page heading */}
      <header className="add-meal-header">
        <div>
          <p className="add-meal-label">Meal tracking</p>
          <h1>Add a Meal</h1>
          <p>Enter your meal’s nutrition information.</p>
        </div>

        <Link className="back-dashboard-button" to="/dashboard">
          <i className="bi bi-arrow-left" aria-hidden="true" />

          <span>Dashboard</span>
        </Link>
      </header>

      <div className="add-meal-content">
        {/* Meal form */}
        <section className="add-meal-form-card">
          <div className="form-card-heading">
            <h2>Meal Details</h2>
            <p>All fields are required before saving.</p>
          </div>

          <form onSubmit={handleSubmit} aria-busy={isSaving}>
            <section className="barcode-scanner" aria-labelledby="barcode-scanner-title">
              <div className="barcode-scanner-heading">
                <div className="barcode-scanner-icon">
                  <i className="bi bi-upc-scan" aria-hidden="true" />
                </div>
                <div>
                  <h3 id="barcode-scanner-title">Scan a barcode</h3>
                  <p>Use your camera to capture a packaged food’s code.</p>
                </div>
                <button
                  className="open-scanner-button"
                  type="button"
                  onClick={startScanner}
                  disabled={isSaving || scannerOpen || isLookingUpBarcode}
                >
                  <i className="bi bi-camera" aria-hidden="true" />
                  Open camera
                </button>
              </div>

              {scannerOpen && (
                <div className="barcode-camera">
                  <video ref={scannerVideoRef} muted playsInline />
                  <span className="scanner-frame" aria-hidden="true" />
                  {torchSupported && (
                    <button type="button" className="torch-button" onClick={() => void toggleTorch()}>
                      <i className={`bi bi-${torchOn ? "flashlight-fill" : "flashlight"}`} aria-hidden="true" />
                      {torchOn ? "Light off" : "Light on"}
                    </button>
                  )}
                  {zoomSupported && (
                    <label className="zoom-control">
                      <i className="bi bi-zoom-in" aria-hidden="true" />
                      <span className="visually-hidden">Camera zoom</span>
                      <input
                        type="range"
                        min="1"
                        max="3"
                        step="0.1"
                        value={zoom}
                        onChange={(event) => void changeZoom(Number(event.target.value))}
                      />
                    </label>
                  )}
                  <button type="button" onClick={stopScanner}>
                    <i className="bi bi-x-lg" aria-hidden="true" />
                    Close camera
                  </button>
                </div>
              )}

              <div className="barcode-manual-entry">
                <label htmlFor="barcodeInput">Or enter the barcode</label>
                <input
                  id="barcodeInput"
                  type="text"
                  inputMode="numeric"
                  value={barcode}
                  onChange={(event) => setBarcode(event.target.value)}
                  placeholder="For example, 012345678905"
                  disabled={isSaving || isLookingUpBarcode}
                />
                <button
                  type="button"
                  onClick={() => void applyBarcode(barcode)}
                  disabled={isSaving || isLookingUpBarcode}
                >
                  {isLookingUpBarcode ? "Looking up…" : "Use code"}
                </button>
              </div>

              {scanStatus && <p className="barcode-status" role="status">{scanStatus}</p>}
            </section>

            {/* Meal name */}
            <div className="meal-form-field">
              <label htmlFor="mealName">Meal name</label>

              <div className="meal-input">
                <i className="bi bi-egg-fried" aria-hidden="true" />

                <input
                  id="mealName"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="For example, chicken rice bowl"
                  autoComplete="off"
                  disabled={isSaving}
                  required
                />
              </div>
            </div>

            {/* Calories, protein and fat */}
            <div className="nutrition-fields">
              {/* Calories */}
              <div className="meal-form-field">
                <label htmlFor="calories">Calories</label>

                <div className="meal-input">
                  <i className="bi bi-fire" aria-hidden="true" />

                  <input
                    id="calories"
                    type="number"
                    min="0"
                    value={calories}
                    onChange={(event) => setCalories(event.target.value)}
                    placeholder="0"
                    disabled={isSaving}
                    required
                  />
                </div>

                <small>Total kcal</small>
              </div>

              {/* Protein */}
              <div className="meal-form-field">
                <label htmlFor="protein">Protein</label>

                <div className="meal-input">
                  <i className="bi bi-lightning-charge" aria-hidden="true" />

                  <input
                    id="protein"
                    type="number"
                    min="0"
                    step="any"
                    inputMode="decimal"
                    value={protein}
                    onChange={(event) => setProtein(event.target.value)}
                    placeholder="0"
                    disabled={isSaving}
                    required
                  />
                </div>

                <small>Amount in grams</small>
              </div>

              {/* Carbohydrates */}
              <div className="meal-form-field">
                <label htmlFor="carbs">Carbohydrates</label>

                <div className="meal-input">
                  <i className="bi bi-circle-half" aria-hidden="true" />

                  <input
                    id="carbs"
                    type="number"
                    min="0"
                    step="any"
                    inputMode="decimal"
                    value={carbs}
                    onChange={(event) => setCarbs(event.target.value)}
                    placeholder="0"
                    disabled={isSaving}
                    required
                  />
                </div>

                <small>Amount in grams</small>
              </div>

              {/* Fat */}
              <div className="meal-form-field">
                <label htmlFor="fat">Fat</label>

                <div className="meal-input">
                  <i className="bi bi-droplet" aria-hidden="true" />

                  <input
                    id="fat"
                    type="number"
                    min="0"
                    step="any"
                    inputMode="decimal"
                    value={fat}
                    onChange={(event) => setFat(event.target.value)}
                    placeholder="0"
                    disabled={isSaving}
                    required
                  />
                </div>

                <small>Amount in grams</small>
              </div>
            </div>

            {/* Display an error if the request fails */}
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            {/* Form buttons */}
            <div className="meal-form-actions">
              <button
                className="cancel-meal-button"
                type="button"
                onClick={() => navigate("/dashboard")}
                disabled={isSaving}
              >
                Cancel
              </button>

              <button
                className="save-meal-button"
                type="submit"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      aria-hidden="true"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg" aria-hidden="true" />
                    Save Meal
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Helpful information */}
        <aside className="meal-information">
          {/* Quick tip */}
          <section className="meal-tip-card">
            <div className="meal-tip-icon">
              <i className="bi bi-lightbulb" aria-hidden="true" />
            </div>

            <h2>Quick Tip</h2>

            <p>
              Use the food label or serving information for more accurate
              nutrition values.
            </p>
          </section>

          {/* Live meal preview */}
          <section className="meal-preview-card">
            <h2>Meal Preview</h2>

            <div className="preview-meal-name">
              <div>
                <i className="bi bi-egg-fried" aria-hidden="true" />
              </div>

              <span>{name.trim() || "Your meal"}</span>
            </div>

            <div className="preview-information">
              <span>Calories</span>
              <strong>{calories || "—"} kcal</strong>
            </div>

            <div className="preview-information">
              <span>Protein</span>
              <strong>{protein || "—"}g</strong>
            </div>

            <div className="preview-information">
              <span>Carbohydrates</span>
              <strong>{carbs || "—"}g</strong>
            </div>

            <div className="preview-information">
              <span>Fat</span>
              <strong>{fat || "—"}g</strong>
            </div>
          </section>

          {/* Privacy information */}
          <section className="meal-private-card">
            <p>
              <i className="bi bi-shield-check" aria-hidden="true" />
              Private by default
            </p>

            <span>Your meal will only appear in your nutrition history.</span>
          </section>
        </aside>
      </div>
    </main>
  );
}

export default AddMeal;
