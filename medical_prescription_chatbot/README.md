# Medical Prescription Analyzer Chatbot

A production-grade, structured medical intelligence platform powered by advanced Vision AI, **LangChain**, and **Streamlit**. This assistant specializes in analyzing medical prescriptions (handwritten or digital) through a multi-step vision reasoning pipeline, extracting structured data, and providing focused medical insights.

---

## Problem Statement

Understanding handwritten medical prescriptions is a long-standing and critical challenge in healthcare systems. Doctors often write prescriptions in highly inconsistent and cursive handwriting, making them difficult to interpret even for trained pharmacists and patients. This leads to several issues:

- Unreadable or ambiguous medicine names
- Incorrect dosage interpretation
- Unclear timing instructions (morning / afternoon / night)
- High risk of medication errors
- Lack of structured, machine-readable prescription data

Traditional OCR systems fail in this domain because medical prescriptions contain irregular handwriting styles, abbreviations and shorthand medical terms, overlapping text and poor image quality, and context-dependent interpretation.

A key challenge is that not all prescriptions are resolvable, and blindly generating structured output from low-quality or ambiguous inputs can produce dangerous and misleading results.

---

## Solution Overview

A Qubrid(Vision)-AI–powered Medical Prescription Analyzer that intelligently understands handwritten prescriptions and converts them into structured, reliable medical data.

### 1. Vision-Based Prescription Understanding
The system leverages a multimodal vision-language model capable of understanding handwritten text directly from prescription images, interpreting medical context, and reasoning across multiple lines and symbols. The model processes prescription images and extracts medicine names, dosage information, intake frequency, and time of consumption (morning / afternoon / night).

### 2. Confidence-Aware Intelligence (Critical Safety Layer)
Each extracted entity is evaluated with a confidence score. If the confidence score falls below 0.7, the system does not generate structured output, displays a clear warning to the user, and explicitly asks the user for manual confirmation or correction. This ensures no garbage or misleading medical data is generated and the system fails safely instead of guessing.

### 3. User-Centric Error Handling
When a prescription cannot be confidently understood, the UI shows a warning state, the user is prompted to manually input or verify unclear details, and the system maintains transparency about AI limitations.

---

## ⚙️ Installation & Setup

1. **repository**:
    ```bash
    
    cd medical-prescription-analyzer-chatbot
    ```

2. **Install dependencies**:
    ```bash
    uv sync
    ```

3. **Configure Environment**:
    Create a `.env` file based on `.env.example` and add your `VISION_API_KEY`.

    ```bash
    VISION_API_KEY=<YOUR_API_KEY>
    VISION_API_BASE=<YOUR_API_BASE_URL>
    ```

4. **Run the application**:
    ```bash
    uv run streamlit run app.py
    ```

---

## 📂 Project Structure

```bash
.
├── app.py                # Main Streamlit application & router
├── backend/
│   ├── chain.py          # VisionChain logic (OCR -> Audit -> Schedule)
│   ├── prompt.py         # Multi-step medical prompts
│   ├── vision_client.py  # Vision API client with SSE streaming
│   └── utils.py          # Image encoding utilities
├── db/                   # SQLite database & access logic
├── services/             # Core business logic (Extraction, Restoration)
├── scheduler/            # Schedule-specific logic and PDF export
├── frontend/
│   ├── pages/            # Page-specific orchestrators
│   ├── ui_components.py  # Shared UI elements
│   └── session_utils.py  # Shared session state management
└── README.md
```

---

## 🚀 Key Features

### 🔍 4-Step Medical Reasoning Pipeline
1. **Vision OCR Extraction**: Transcribes text from the image, focusing on medicine names and dosages.
2. **Entity Normalization**: Converts raw text into a structured JSON schema.
3. **Ambiguity Audit**: Identifies low-confidence extractions or missing information.
4. **Final Audit**: Performs a safety check on extracted instructions and conflicting timings.

### 📅 Smart Prescription Schedule
- **Readiness Gate**: Automatically flags missing critical info (Dosage, Frequency, Duration).
- **Guided Clarification**: Interactive form-based UI to fill data gaps before generation.
- **Visual Timeline**: Tabular daily schedule with Morning/Afternoon/Night slots.
- **PDF Export**: Downloadable medication schedule with mandatory patient disclaimers.

### 💾 Persistent Intelligence (SQLite)
- **Conversation Restore**: Automatic storage of prescriptions and chat history.
- **Duplicate Detection**: SHA-256 hashes to instantly restore previously analyzed images.
- **Multi-Page State**: Consistent data across "Analyzer" and "Smart Scheduler" workflows.

---

## ⚠️ Disclaimer

**This tool is for informational and educational purposes only.** The analysis provided is AI-generated and should **not** be used for self-diagnosis or treatment. **Always verify any AI analysis with a qualified healthcare professional or pharmacist before taking any medication.**
