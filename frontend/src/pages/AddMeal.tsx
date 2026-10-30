import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BrowserMultiFormatOneDReader,
  type IScannerControls,
} from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";

import {
  analyzeMealPhoto,
  analyzeNutritionLabel,
  createMeal,
  getFoodByBarcode,
} from "../services/mealApi";

import "../styles/AddMeal.css";

type ScannerDetector = {
  detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue?: string }>>;
};

type ScannerWindow = Window & {
  BarcodeDetector?: new (options?: { formats?: string[] }) => ScannerDetector;
};

const AI_MEAL_NAME_LIMIT = 52;

function formatNutritionValue(value: number) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue.toFixed(2) : "0.00";
}

function createConciseMealName(itemNames: string[]) {
  const names = itemNames.map((name) => name.trim()).filter(Boolean);
  const visibleNames = names.slice(0, 2);
  const remainingCount = names.length - visibleNames.length;
  const summary = `${visibleNames.join(", ")}${
    remainingCount > 0 ? ` +${remainingCount} more` : ""
  }` || "Meal";

  return summary.length > AI_MEAL_NAME_LIMIT
    ? `${summary.slice(0, AI_MEAL_NAME_LIMIT - 1).trimEnd()}…`
    : summary;
}

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
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [photoStatus, setPhotoStatus] = useState("");
  const [mealCameraOpen, setMealCameraOpen] = useState(false);
  const [mealCameraFacing, setMealCameraFacing] = useState<"environment" | "user">("environment");
  const [labelCameraOpen, setLabelCameraOpen] = useState(false);
  const [labelCameraFacing, setLabelCameraFacing] = useState<"environment" | "user">("environment");
  const [labelStatus, setLabelStatus] = useState("");
  const [isReadingLabel, setIsReadingLabel] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const labelInputRef = useRef<HTMLInputElement>(null);
  const labelLibraryInputRef = useRef<HTMLInputElement>(null);
  const mealCameraVideoRef = useRef<HTMLVideoElement>(null);
  const mealCameraStreamRef = useRef<MediaStream | null>(null);
  const mealCameraCanvasRef = useRef<HTMLCanvasElement>(null);
  const labelCameraVideoRef = useRef<HTMLVideoElement>(null);
  const labelCameraStreamRef = useRef<MediaStream | null>(null);
  const labelCameraCanvasRef = useRef<HTMLCanvasElement>(null);

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
  const [scannerCameraFacing, setScannerCameraFacing] = useState<"environment" | "user">("environment");

  // Track the backend request
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      stopScanner();
      stopMealCamera();
      stopLabelCamera();
    };
  }, []);

  useEffect(() => {
    if (!mealCameraOpen) return;

    const video = mealCameraVideoRef.current;
    const stream = mealCameraStreamRef.current;
    if (!video || !stream) return;

    video.srcObject = stream;
    void video.play().catch(() => {
      setPhotoStatus(
        "Tap the camera preview or allow camera access in Safari.",
      );
    });
  }, [mealCameraOpen]);

  useEffect(() => {
    if (!labelCameraOpen) return;

    const video = labelCameraVideoRef.current;
    const stream = labelCameraStreamRef.current;
    if (!video || !stream) return;

    video.srcObject = stream;
    void video.play().catch(() => {
      setLabelStatus("Tap the camera preview or allow camera access in Safari.");
    });
  }, [labelCameraOpen]);

  function stopMealCamera() {
    mealCameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    mealCameraStreamRef.current = null;
    if (mealCameraVideoRef.current) {
      mealCameraVideoRef.current.srcObject = null;
    }
    setMealCameraOpen(false);
  }

  function stopLabelCamera() {
    labelCameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    labelCameraStreamRef.current = null;
    if (labelCameraVideoRef.current) labelCameraVideoRef.current.srcObject = null;
    setLabelCameraOpen(false);
  }

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
      setCalories(formatNutritionValue(food.calories));
      setProtein(formatNutritionValue(food.protein));
      setCarbs(formatNutritionValue(food.carbs));
      setFat(formatNutritionValue(food.fat));

      const nutritionBasis = food.nutritionBasis || "per 100 g";
      const servingNote = food.servingSize
        ? ` Values are ${nutritionBasis}; package serving: ${food.servingSize}.`
        : ` Values are ${nutritionBasis}.`;
      setScanStatus(
        `Calories, protein, carbohydrates, and fat were added to Meal Details.${servingNote}`,
      );
    } catch {
      setName(
        (currentName) => currentName || `Product barcode: ${trimmedBarcode}`,
      );
      setScanStatus(
        "Could not find nutrition data. Enter the package label values manually.",
      );
    } finally {
      setIsLookingUpBarcode(false);
    }
  }

  async function analyzePhotoFile(file: File) {
    setIsAnalyzingPhoto(true);
    setPhotoStatus("Analyzing your meal photo…");
    setError("");

    try {
      const result = await analyzeMealPhoto(file);
      const firstItem = result.items[0];
      if (!firstItem) throw new Error("No food was detected.");

      setName(createConciseMealName(result.items.map((item) => item.name)));
      setCalories(formatNutritionValue(result.total_calories));
      setProtein(
        formatNutritionValue(
          result.items.reduce((sum, item) => sum + item.protein_g, 0),
        ),
      );
      setCarbs(
        formatNutritionValue(
          result.items.reduce((sum, item) => sum + item.carbs_g, 0),
        ),
      );
      setFat(
        formatNutritionValue(
          result.items.reduce((sum, item) => sum + item.fat_g, 0),
        ),
      );
      setPhotoStatus(
        `Nutrition added from photo. ${result.confidence_explanation}`,
      );
    } catch (requestError) {
      console.error(requestError);
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Could not analyze the photo.";
      setPhotoStatus(`${message} You can enter the nutrition manually.`);
    } finally {
      setIsAnalyzingPhoto(false);
    }
  }

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) await analyzePhotoFile(file);
  }

  async function analyzeLabelFile(file: File) {
    setIsReadingLabel(true);
    setLabelStatus("Reading the nutrition label…");
    setError("");

    try {
      const result = await analyzeNutritionLabel(file);
      setName((currentName) => currentName || result.product_name);
      setCalories(formatNutritionValue(result.calories));
      setProtein(formatNutritionValue(result.protein_g));
      setCarbs(formatNutritionValue(result.carbs_g));
      setFat(formatNutritionValue(result.fat_g));
      setLabelStatus(
        `Label values added ${result.nutrition_basis}. Review them before saving. ${result.confidence_explanation}`,
      );
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Could not read the nutrition label.";
      setLabelStatus(`${message} Try a closer, well-lit photo.`);
    } finally {
      setIsReadingLabel(false);
    }
  }

  async function handleLabelChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) await analyzeLabelFile(file);
  }

  async function startMealCamera(
    facingMode: "environment" | "user" = mealCameraFacing,
  ) {
    if (!navigator.mediaDevices?.getUserMedia) {
      setPhotoStatus(
        "Live camera access is unavailable. Use Choose photo instead.",
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facingMode } },
        audio: false,
      });
      mealCameraStreamRef.current = stream;
      setMealCameraOpen(true);
    } catch {
      setPhotoStatus("Camera access was denied. Use Choose photo instead.");
      stopMealCamera();
    }
  }

  async function flipMealCamera() {
    const nextFacingMode =
      mealCameraFacing === "environment" ? "user" : "environment";

    stopMealCamera();
    setMealCameraFacing(nextFacingMode);
    await startMealCamera(nextFacingMode);
  }

  async function captureMealPhoto() {
    const video = mealCameraVideoRef.current;
    const canvas = mealCameraCanvasRef.current;
    if (!video || !canvas || !video.videoWidth || !video.videoHeight) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setPhotoStatus("Could not capture the camera image.");
          return;
        }
        stopMealCamera();
        void analyzePhotoFile(
          new File([blob], "meal-camera-photo.jpg", { type: "image/jpeg" }),
        );
      },
      "image/jpeg",
      0.9,
    );
  }

  async function startLabelCamera(
    facingMode: "environment" | "user" = labelCameraFacing,
  ) {
    if (!navigator.mediaDevices?.getUserMedia) {
      setLabelStatus("Live camera access is unavailable. Use Choose label photo instead.");
      return;
    }

    try {
      labelCameraStreamRef.current = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
      setLabelCameraOpen(true);
    } catch {
      setLabelStatus("Camera access was denied. Use Choose label photo instead.");
      stopLabelCamera();
    }
  }

  async function flipLabelCamera() {
    const nextFacingMode =
      labelCameraFacing === "environment" ? "user" : "environment";

    stopLabelCamera();
    setLabelCameraFacing(nextFacingMode);
    await startLabelCamera(nextFacingMode);
  }

  async function captureLabelPhoto() {
    const video = labelCameraVideoRef.current;
    const canvas = labelCameraCanvasRef.current;
    if (!video || !canvas || !video.videoWidth || !video.videoHeight) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) {
        setLabelStatus("Could not capture the label image.");
        return;
      }
      stopLabelCamera();
      void analyzeLabelFile(
        new File([blob], "nutrition-label.jpg", { type: "image/jpeg" }),
      );
    }, "image/jpeg", 0.92);
  }

  async function startScanner(
    facingMode: "environment" | "user" = scannerCameraFacing,
  ) {
    const detectorConstructor = (window as ScannerWindow).BarcodeDetector;

    if (!navigator.mediaDevices?.getUserMedia) {
      setScanStatus(
        "Camera access is unavailable. Enter the barcode manually below.",
      );
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
          facingMode: { ideal: facingMode },
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
        const hints = new Map<DecodeHintType, BarcodeFormat[] | boolean>();
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [
          BarcodeFormat.EAN_13,
          BarcodeFormat.EAN_8,
          BarcodeFormat.UPC_A,
          BarcodeFormat.UPC_E,
          BarcodeFormat.CODE_128,
        ]);
        hints.set(DecodeHintType.TRY_HARDER, true);
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

          const context = canvas.getContext("2d", { willReadFrequently: true });
          if (!context) return;

          // Keep the original crop first for reliable everyday scanning, then
          // retry with a larger, upscaled crop for short barcodes.
          const scanRegions = [
            { width: 0.82, height: 0.5, scale: 1 },
            { width: 0.92, height: 0.7, scale: 2 },
          ];

          for (const region of scanRegions) {
            const cropWidth = Math.floor(sourceWidth * region.width);
            const cropHeight = Math.floor(sourceHeight * region.height);
            const cropX = Math.floor((sourceWidth - cropWidth) / 2);
            const cropY = Math.floor((sourceHeight - cropHeight) / 2);
            canvas.width = cropWidth * region.scale;
            canvas.height = cropHeight * region.scale;
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
              // Try the next crop before waiting for another frame.
            }
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
      setScanStatus(
        "Camera access was denied or unavailable. Enter the barcode manually below.",
      );
    }
  }

  async function flipScannerCamera() {
    const nextFacingMode =
      scannerCameraFacing === "environment" ? "user" : "environment";

    stopScanner();
    setScannerCameraFacing(nextFacingMode);
    await startScanner(nextFacingMode);
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
            <section
              className="photo-recognition"
              aria-labelledby="photo-recognition-title"
            >
              <div>
                <h3 id="photo-recognition-title">NutriVision AI</h3>
                <p>Upload a photo and we’ll estimate the nutrition for you.</p>
              </div>
              {mealCameraOpen && (
                <div className="meal-camera-preview">
                  <video ref={mealCameraVideoRef} muted playsInline />
                  <button
                    className="meal-flip-camera-button"
                    type="button"
                    onClick={() => void flipMealCamera()}
                    disabled={isAnalyzingPhoto}
                    aria-label="Switch camera"
                    title="Switch camera"
                  >
                    <i className="bi bi-arrow-repeat" aria-hidden="true" />
                  </button>
                  <div className="meal-camera-actions">
                    <button
                      className="meal-capture-button"
                      type="button"
                      onClick={() => void captureMealPhoto()}
                      disabled={isAnalyzingPhoto}
                    >
                      <span className="meal-capture-icon" aria-hidden="true">
                        <i className="bi bi-camera-fill" />
                      </span>
                      {isAnalyzingPhoto ? "Analyzing…" : "Capture photo"}
                    </button>
                    <button
                      className="meal-close-camera-button"
                      type="button"
                      onClick={stopMealCamera}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
              <canvas
                ref={mealCameraCanvasRef}
                className="photo-input"
                aria-hidden="true"
              />
              <input
                ref={photoInputRef}
                className="photo-input"
                type="file"
                accept="image/*"
                onChange={(event) => void handlePhotoChange(event)}
                disabled={isSaving || isAnalyzingPhoto}
              />
              <div className="photo-recognition-actions">
                <button
                  className="photo-recognition-button"
                  type="button"
                  onClick={() => void startMealCamera()}
                  disabled={isSaving || isAnalyzingPhoto || mealCameraOpen}
                >
                  <i className="bi bi-camera-video" aria-hidden="true" />
                  Open live camera
                </button>
                <button
                  className="photo-recognition-button photo-upload-button"
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  disabled={isSaving || isAnalyzingPhoto || mealCameraOpen}
                >
                  <i className="bi bi-image" aria-hidden="true" />
                  {isAnalyzingPhoto ? "Analyzing…" : "Choose photo"}
                </button>
              </div>
              {photoStatus && (
                <p className="photo-status" role="status">
                  {photoStatus}
                </p>
              )}
            </section>

            <section className="label-scanner" aria-labelledby="label-scanner-title">
              <div className="label-scanner-heading">
                <div className="label-scanner-icon">
                  <i className="bi bi-card-text" aria-hidden="true" />
                </div>
                <div>
                  <h3 id="label-scanner-title">Scan a nutrition label</h3>
                  <p>Point your camera at the Nutrition Facts panel.</p>
                </div>
                <button
                  className="open-scanner-button"
                  type="button"
                  onClick={() => void startLabelCamera()}
                  disabled={isSaving || labelCameraOpen || isReadingLabel}
                >
                  <i className="bi bi-camera" aria-hidden="true" />
                  Open camera
                </button>
              </div>
              <div className="label-scanner-note">
                <i className="bi bi-stars" aria-hidden="true" />
                <span>We'll read the serving size and core macros for you.</span>
              </div>

              {labelCameraOpen && (
                <div className="label-camera">
                  <video ref={labelCameraVideoRef} muted playsInline />
                  <span className="label-scanner-frame" aria-hidden="true" />
                  <button
                    className="label-flip-camera-button"
                    type="button"
                    onClick={() => void flipLabelCamera()}
                    disabled={isReadingLabel}
                    aria-label="Switch camera"
                    title="Switch camera"
                  >
                    <i className="bi bi-arrow-repeat" aria-hidden="true" />
                  </button>
                  <div className="label-camera-actions">
                    <button
                      className="label-capture-button"
                      type="button"
                      onClick={() => void captureLabelPhoto()}
                      disabled={isReadingLabel}
                    >
                      <span className="label-capture-icon" aria-hidden="true">
                        <i className="bi bi-camera-fill" />
                      </span>
                      {isReadingLabel ? "Reading label…" : "Capture label"}
                    </button>
                    <button
                      className="label-close-camera-button"
                      type="button"
                      onClick={stopLabelCamera}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
              <canvas ref={labelCameraCanvasRef} className="photo-input" aria-hidden="true" />
              <input
                ref={labelInputRef}
                className="photo-input"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(event) => void handleLabelChange(event)}
                disabled={isSaving || isReadingLabel}
              />
              <input
                ref={labelLibraryInputRef}
                className="photo-input"
                type="file"
                accept="image/*"
                onChange={(event) => void handleLabelChange(event)}
                disabled={isSaving || isReadingLabel}
              />
              <div className="photo-recognition-actions">
                <button
                  className="photo-recognition-button"
                  type="button"
                  onClick={() => labelInputRef.current?.click()}
                  disabled={isSaving || isReadingLabel || labelCameraOpen}
                >
                  <i className="bi bi-camera" aria-hidden="true" />
                  Use phone camera
                </button>
                <button
                  className="photo-recognition-button photo-upload-button"
                  type="button"
                  onClick={() => labelLibraryInputRef.current?.click()}
                  disabled={isSaving || isReadingLabel || labelCameraOpen}
                >
                  <i className="bi bi-images" aria-hidden="true" />
                  Photo library
                </button>
              </div>
              {labelStatus && <p className="photo-status" role="status">{labelStatus}</p>}
            </section>

            <section
              className="barcode-scanner"
              aria-labelledby="barcode-scanner-title"
            >
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
                  onClick={() => void startScanner()}
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
                  <button
                    className="barcode-flip-camera-button"
                    type="button"
                    onClick={() => void flipScannerCamera()}
                    aria-label="Switch camera"
                    title="Switch camera"
                  >
                    <i className="bi bi-arrow-repeat" aria-hidden="true" />
                  </button>
                  {torchSupported && (
                    <button
                      type="button"
                      className="torch-button"
                      onClick={() => void toggleTorch()}
                    >
                      <i
                        className={`bi bi-${torchOn ? "flashlight-fill" : "flashlight"}`}
                        aria-hidden="true"
                      />
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
                        onChange={(event) =>
                          void changeZoom(Number(event.target.value))
                        }
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

              {scanStatus && (
                <p className="barcode-status" role="status">
                  {scanStatus}
                </p>
              )}
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
