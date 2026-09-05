import React, { useRef, useState } from "react";

import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  RotateCcw,
  ScanLine,
} from "lucide-react";
import { toast } from "react-toastify";
import { addMedicine } from "../../api/backend";

const WebcamMedicineOCR = ({
  onBack,
  onExtract,
  initialData = {},
}) => {

  // ============================================
  // EMPTY MEDICINE DATA
  // ============================================

  const emptyDetails = {
    medicineName: "",
    strength: "",
    batchNumber: "",
    manufacturingDate: "",
    expiryDate: "",
    price: "",
    stock: "",
    category: "",
    manufacturer: "",
    description: "",
  };


  // ============================================
  // REFS
  // ============================================

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);


  // ============================================
  // STATES
  // ============================================

  const [cameraOn, setCameraOn] = useState(false);

  const [loading, setLoading] = useState(false);

  const [saving, setSaving] = useState(false);

  const [details, setDetails] = useState({
    ...emptyDetails,
    ...initialData,
  });


  // ============================================
  // UPDATE FORM FIELD
  // ============================================

  const updateDetail = (name, value) => {

    setDetails((prev) => ({
      ...prev,
      [name]: value,
    }));

  };


  // ============================================
  // CONTINUE
  // ============================================

  const handleContinue = async () => {

    if (saving) {

      console.log(
        "⏳ Already saving..."
      );

      return;

    }


    // ========================================
    // VALIDATE REQUIRED FIELDS (matches backend)
    // ========================================

    if (
      !details.medicineName ||
      !details.batchNumber ||
      !details.manufacturingDate ||
      !details.expiryDate ||
      details.price === "" ||
      details.stock === ""
    ) {

      toast.error(
        "Medicine name, batch number, dates, price aur stock zaroori hain."
      );

      return;

    }


    try {

      console.log("=================================");
      console.log("FINAL MEDICINE DATA");
      console.log("=================================");

      console.table(details);


      setSaving(true);


      console.log(
        "🚀 Saving medicine to pharmacy..."
      );


      const response =
        await addMedicine({
          ...details,
          addedVia: "OCR",
        });


      console.log(
        "✅ Medicine saved:",
        response.data
      );


      if (onExtract) {
        onExtract(details);
      }

    } catch (error) {

      console.error(
        "❌ Failed to save medicine:",
        error
      );

      console.error(
        "❌ Backend response data:",
        error?.response?.data
      );

      toast.error(
        error?.response?.data?.msg ||
        error?.response?.data?.message ||
        error?.message ||
        "Medicine save nahi hua."
      );

    } finally {

      setSaving(false);

    }

  };


  // ============================================
  // START CAMERA
  // ============================================

  const startCamera = async () => {

    try {

      console.log("📷 Starting camera...");

      const stream =
        await navigator.mediaDevices.getUserMedia({

          video: {
            facingMode: "environment",

            width: {
              ideal: 1920,
            },

            height: {
              ideal: 1080,
            },
          },

          audio: false,

        });


      console.log("✅ Camera started");

      console.log(
        "Camera tracks:",
        stream.getVideoTracks()
      );


      streamRef.current = stream;


      if (videoRef.current) {

        videoRef.current.srcObject = stream;

      }


      setCameraOn(true);

    } catch (error) {

      console.error(
        "❌ Camera error:",
        error
      );

      toast.error(
        "Camera permission nahi mili. Browser settings se camera permission allow karo."
      );

    }

  };


  // ============================================
  // STOP CAMERA
  // ============================================

  const stopCamera = () => {

    console.log("🛑 Stopping camera...");


    if (streamRef.current) {

      streamRef.current
        .getTracks()
        .forEach((track) => {
          track.stop();
        });

      streamRef.current = null;

    }


    if (videoRef.current) {

      videoRef.current.srcObject = null;

    }


    setCameraOn(false);

  };


  // ============================================
  // CAPTURE IMAGE FROM WEBCAM
  // ============================================

  const captureImage = () => {

    const video = videoRef.current;

    const canvas = canvasRef.current;


    if (!video || !canvas) {

      console.error(
        "❌ Video or canvas missing"
      );

      return null;

    }


    console.log(
      "📐 Video dimensions:",
      {
        width: video.videoWidth,
        height: video.videoHeight,
      }
    );


    // Camera frame ready hai ya nahi
    if (
      !video.videoWidth ||
      !video.videoHeight
    ) {

      toast.error(
        "Camera frame ready nahi hai. Thoda wait karke dobara try karo."
      );

      return null;

    }


    // Canvas ko camera ke actual resolution ke equal rakho

    canvas.width = video.videoWidth;

    canvas.height = video.videoHeight;


    const ctx =
      canvas.getContext("2d");


    if (!ctx) {

      console.error(
        "❌ Canvas context not available"
      );

      return null;

    }


    // Webcam frame canvas par draw karo

    ctx.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );


    console.log(
      "📸 Webcam frame captured"
    );


    // Canvas → Blob → File

    return new Promise((resolve) => {

      canvas.toBlob(
        (blob) => {

          if (!blob) {

            console.error(
              "❌ Failed to create image blob"
            );

            resolve(null);

            return;

          }


          console.log(
            "✅ Blob created"
          );

          console.log(
            "Blob size:",
            blob.size
          );

          console.log(
            "Blob type:",
            blob.type
          );


          const file = new File(
            [blob],
            "medicine.jpg",
            {
              type: "image/jpeg",
            }
          );


          console.log(
            "📁 Medicine file created:",
            file
          );


          resolve(file);

        },

        "image/jpeg",

        0.95

      );

    });

  };


  // ============================================
  // GEMINI QUESTION
  // ============================================

  const MEDICINE_QUESTION = `
Analyze this medicine image and return ONLY valid JSON.

Use exactly these fields:

{
  "medicineName": "",
  "strength": "",
  "batchNumber": "",
  "manufacturingDate": "",
  "expiryDate": "",
  "price": 0,
  "category": "",
  "manufacturer": "",
  "description": ""
}

Rules:

- medicineName: exact medicine name visible on the package
- strength: active ingredients and their strengths
- batchNumber: batch number visible on the package
- manufacturingDate: manufacturing date visible on the package
- expiryDate: expiry date visible on the package
- price: MRP/price visible on the package as a number
- category: medicine category/use category
- manufacturer: manufacturer name visible on the package
- description: short description of the medicine and its use
- If any field is not visible, return null.
- Do not add markdown.
- Do not add explanations outside JSON.
`;


  // ============================================
  // SCAN MEDICINE
  // ============================================

  const scanMedicine = async () => {

    if (loading) {

      console.log(
        "⏳ Already scanning..."
      );

      return;

    }


    try {

      console.log(
        "================================="
      );

      console.log(
        "🔍 CAPTURE & ANALYZE CLICKED"
      );

      console.log(
        "================================="
      );


      setLoading(true);


      // ========================================
      // 1. CAPTURE IMAGE
      // ========================================

      const file =
        await captureImage();


      if (!file) {

        setLoading(false);

        return;

      }


      // ========================================
      // 2. CREATE FORMDATA
      // ========================================

      const formData =
        new FormData();


      formData.append(
        "image",
        file
      );


      formData.append(
        "question",
        MEDICINE_QUESTION
      );


      console.log(
        "📦 FormData prepared"
      );

      console.log(
        "Image name:",
        file.name
      );

      console.log(
        "Image size:",
        file.size
      );

      console.log(
        "Image type:",
        file.type
      );


      // ========================================
      // 3. SEND IMAGE TO YOUR API
      // ========================================

      console.log(
        "🚀 Sending image to Render API..."
      );


      const response = await fetch(
        "http://localhost:3000/api/medicine/analyze",
        {
            method: "POST",
            body: formData,
        }
    );

      console.log(
        "🌐 API status:",
        response.status
      );


      // ========================================
      // 4. GET API RESPONSE
      // ========================================

      const result =
        await response.json();


      console.log(
        "📥 Raw API response:"
      );

      console.log(result);


      // ========================================
      // 5. CHECK RESPONSE
      // ========================================
      //
      // Backend (analyzeMedicine controller) returns:
      //   { success: true, data: { medicineName, strength, ... } }
      // It already parses the AI's JSON for us, so we must
      // read `result.data`, NOT `result.answer`.

      if (!response.ok || !result.success) {

        throw new Error(
          result?.message ||
          "Medicine analysis failed"
        );

      }


      if (!result.data) {

        throw new Error(
          "API response mein 'data' nahi mila."
        );

      }


      // ========================================
      // 6. USE PARSED DATA (backend already parsed it)
      // ========================================

      console.log(
        "🔄 Reading medicine data from response..."
      );


      const medicineData = result.data;


      // ========================================
      // 7. SHOW RESULT
      // ========================================

      console.log(
        "💊 Medicine details:"
      );

      console.table(
        medicineData
      );


      // ========================================
      // 8. AUTOFILL FORM
      // ========================================

      setDetails({

        medicineName:
          medicineData.medicineName ?? "",

        strength:
          medicineData.strength ?? "",

        batchNumber:
          medicineData.batchNumber ?? "",

        manufacturingDate:
          medicineData.manufacturingDate ?? "",

        expiryDate:
          medicineData.expiryDate ?? "",

        price:
          medicineData.price ?? "",

        stock:
          details.stock || "",

        category:
          medicineData.category ?? "",

        manufacturer:
          medicineData.manufacturer ?? "",

        description:
          medicineData.description ?? "",

      });


      console.log(
        "================================="
      );

      console.log(
        "✅ FORM AUTOFILLED SUCCESSFULLY"
      );

      console.log(
        "================================="
      );


    } catch (error) {

      console.error(
        "❌ Medicine analysis failed:",
        error
      );


      toast.error(
        error?.message ||
        "Medicine scan failed."
      );

    } finally {

      setLoading(false);

    }

  };


  // ============================================
  // RESET FORM
  // ============================================

  const resetScan = () => {

    console.log(
      "🔄 Resetting medicine details..."
    );


    setDetails({
      ...emptyDetails,
      ...initialData,
    });

  };


  // ============================================
  // COMPONENT UI
  // ============================================

  return (

    <div className="w-full">


      {/* ======================================
          HEADER
      ======================================= */}

      <div className="mb-7 flex items-center gap-4">

        {onBack && (

          <button
            onClick={() => {

              stopCamera();

              onBack();

            }}
            className="flex h-10 w-10 items-center justify-center rounded-control border border-outline-variant bg-surface-lowest text-on-surface-variant transition hover:bg-surface-container hover:text-on-surface"
          >

            <ArrowLeft size={19} />

          </button>

        )}


        <div>

          <h1 className="font-display text-headline-lg text-on-surface">

            Scan Medicine

          </h1>


          <p className="mt-1 text-body-md text-on-surface-variant">

            Capture the medicine package and extract its details.

          </p>

        </div>

      </div>


      {/* ======================================
          MAIN GRID
      ======================================= */}

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">


        {/* ====================================
            CAMERA SECTION
        ===================================== */}

        <div className="rounded-card border border-outline-variant bg-surface-lowest p-5">


          {/* CAMERA HEADER */}

          <div className="mb-4 flex items-center justify-between">

            <div className="flex items-center gap-2">

              <ScanLine
                size={20}
                className="text-primary"
              />

              <h2 className="font-display text-headline-sm text-on-surface">

                Medicine Scanner

              </h2>

            </div>


            {cameraOn && (

              <span className="flex items-center gap-2 text-label-md font-medium text-primary">

                <span className="h-2 w-2 rounded-pill bg-primary" />

                Camera Active

              </span>

            )}

          </div>


          {/* CAMERA VIEW */}

          <div className="relative aspect-video overflow-hidden rounded-card bg-inverse-surface">


            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
            />


            {/* CAMERA OFF */}

            {!cameraOn && (

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-inverse-on-surface/70">

                <Camera size={42} />

                <p className="mt-3 text-body-md">

                  Camera is currently off

                </p>

                <p className="mt-1 text-body-sm">

                  Start camera to scan medicine

                </p>

              </div>

            )}


            {/* SCANNING FRAME */}

            {cameraOn && (

              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">

                <div className="relative h-[55%] w-[85%] rounded-card border-2 border-primary">

                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-control bg-inverse-surface/85 px-3 py-1 text-label-md text-inverse-on-surface">

                    Place medicine inside the frame

                  </span>

                </div>

              </div>

            )}

          </div>


          {/* HIDDEN CANVAS */}

          <canvas
            ref={canvasRef}
            className="hidden"
          />


          {/* BUTTONS */}

          <div className="mt-5 flex gap-3">


            {!cameraOn ? (

              <button
                onClick={startCamera}
                className="flex flex-1 items-center justify-center gap-2 rounded-control bg-primary px-5 py-2.5 text-body-md font-semibold text-on-primary transition hover:brightness-110"
              >

                <Camera size={18} />

                Start Camera

              </button>

            ) : (

              <>

                <button
                  onClick={scanMedicine}
                  disabled={loading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-control bg-primary px-5 py-2.5 text-body-md font-semibold text-on-primary transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  <ScanLine size={18} />

                  {loading
                    ? "Analyzing..."
                    : "Capture & Analyze"}

                </button>


                <button
                  onClick={stopCamera}
                  disabled={loading}
                  className="rounded-control border border-outline-variant px-5 py-2.5 text-body-md font-medium text-on-surface transition hover:bg-surface-container disabled:opacity-50"
                >

                  Stop

                </button>

              </>

            )}

          </div>


          {/* LOADING MESSAGE */}

          {loading && (

            <div className="mt-5 rounded-card border border-outline-variant bg-surface-container p-4">

              <div className="flex items-center gap-3">

                <div className="h-5 w-5 animate-spin rounded-pill border-2 border-primary border-t-transparent" />

                <div>

                  <p className="text-title-card text-on-surface">

                    Analyzing medicine...

                  </p>

                  <p className="mt-1 text-body-sm text-on-surface-variant">

                    Please wait while the medicine details are extracted.

                  </p>

                </div>

              </div>

            </div>

          )}


          {/* INSTRUCTIONS */}

          <div className="mt-5 rounded-card border border-outline-variant bg-surface-container p-4">

            <p className="text-title-card text-on-surface">

              For better accuracy

            </p>


            <ul className="mt-2 space-y-1 text-body-sm text-on-surface-variant">

              <li>
                • Keep the medicine package straight.
              </li>

              <li>
                • Place the medicine inside the blue frame.
              </li>

              <li>
                • Make sure text is clearly visible.
              </li>

              <li>
                • Avoid glare and reflections.
              </li>

              <li>
                • Keep the camera steady.
              </li>

            </ul>

          </div>

        </div>


        {/* ====================================
            DETAILS SECTION
        ===================================== */}

        <div className="rounded-card border border-outline-variant bg-surface-lowest p-5">


          {/* DETAILS HEADER */}

          <div className="mb-5 flex items-center justify-between">

            <div>

              <h2 className="font-display text-headline-sm text-on-surface">

                Extracted Details

              </h2>


              <p className="mt-1 text-body-sm text-on-surface-variant">

                Review and correct the information before saving.

              </p>

            </div>


            {details.medicineName && (

              <CheckCircle2
                size={22}
                className="text-primary"
              />

            )}

          </div>


          {/* FORM */}

          <div className="space-y-4">


            <OCRInput
              label="Medicine Name"
              value={details.medicineName}
              onChange={(value) =>
                updateDetail(
                  "medicineName",
                  value
                )
              }
            />


            <OCRInput
              label="Strength"
              value={details.strength}
              onChange={(value) =>
                updateDetail(
                  "strength",
                  value
                )
              }
            />


            <OCRInput
              label="Batch Number"
              value={details.batchNumber}
              onChange={(value) =>
                updateDetail(
                  "batchNumber",
                  value
                )
              }
            />


            <div className="grid grid-cols-2 gap-3">

              <OCRInput
                label="Manufacturing Date"
                value={
                  details.manufacturingDate
                }
                onChange={(value) =>
                  updateDetail(
                    "manufacturingDate",
                    value
                  )
                }
              />


              <OCRInput
                label="Expiry Date"
                value={
                  details.expiryDate
                }
                onChange={(value) =>
                  updateDetail(
                    "expiryDate",
                    value
                  )
                }
              />

            </div>


            <OCRInput
              label="Price / MRP"
              value={details.price}
              onChange={(value) =>
                updateDetail(
                  "price",
                  value
                )
              }
            />


            <OCRInput
              label="Stock / Quantity"
              value={details.stock}
              onChange={(value) =>
                updateDetail(
                  "stock",
                  value
                )
              }
            />


            <OCRInput
              label="Category"
              value={details.category}
              onChange={(value) =>
                updateDetail(
                  "category",
                  value
                )
              }
            />


            <OCRInput
              label="Manufacturer"
              value={details.manufacturer}
              onChange={(value) =>
                updateDetail(
                  "manufacturer",
                  value
                )
              }
            />


            <div>

              <label className="mb-1.5 block text-label-md font-medium text-on-surface-variant">

                Description

              </label>


              <textarea
                value={
                  details.description || ""
                }
                onChange={(e) =>
                  updateDetail(
                    "description",
                    e.target.value
                  )
                }
                rows={4}
                placeholder="Not detected"
                className="w-full resize-none rounded-control border border-outline-variant bg-surface-lowest px-3 py-2.5 text-body-md text-on-surface outline-none transition placeholder:text-on-surface-variant focus:border-primary"
              />

            </div>

          </div>


          {/* ACTION BUTTONS */}

          {details.medicineName && (

            <div className="mt-5 flex gap-2">


              <button
                onClick={resetScan}
                disabled={loading || saving}
                className="flex items-center gap-2 rounded-control border border-outline-variant px-4 py-2.5 text-body-md font-medium text-on-surface transition hover:bg-surface-container disabled:opacity-50"
              >

                <RotateCcw size={16} />

                Reset

              </button>


              <button
                onClick={handleContinue}
                disabled={loading || saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-control bg-primary px-4 py-2.5 text-body-md font-semibold text-on-primary transition hover:brightness-110 disabled:opacity-50"
              >

                {saving ? "Saving..." : "Continue"}

                {!saving && (
                  <ArrowLeft
                    size={16}
                    className="rotate-180"
                  />
                )}

              </button>

            </div>

          )}

        </div>

      </div>

    </div>

  );
};


// ============================================
// REUSABLE INPUT
// ============================================

const OCRInput = ({
  label,
  value,
  onChange,
}) => {

  return (

    <div>

      <label className="mb-1.5 block text-label-md font-medium text-on-surface-variant">

        {label}

      </label>


      <input
        type="text"
        value={value ?? ""}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder="Not detected"
        className="w-full rounded-control border border-outline-variant bg-surface-lowest px-3 py-2.5 text-body-md text-on-surface outline-none transition placeholder:text-on-surface-variant focus:border-primary"
      />

    </div>

  );

};


export default WebcamMedicineOCR;