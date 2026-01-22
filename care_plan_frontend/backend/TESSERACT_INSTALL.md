# Tesseract OCR Installation Guide

## What is Tesseract?

Tesseract is an OCR (Optical Character Recognition) engine used to extract text from scanned PDFs and images. It's **optional** for this project - the backend will work without it, but OCR features (like checkbox detection with labels) will be limited.

## Installation on Windows

### Option 1: Using Installer (Recommended)

1. **Download Tesseract:**
   - Go to: https://github.com/UB-Mannheim/tesseract/wiki
   - Download the latest Windows installer (e.g., `tesseract-ocr-w64-setup-5.x.x.exe`)

2. **Install:**
   - Run the installer
   - **Important:** Note the installation path (usually `C:\Program Files\Tesseract-OCR\`)
   - Add Tesseract to PATH during installation (or manually add it later)

3. **Verify Installation:**
   ```bash
   tesseract --version
   ```
   Should output version number (e.g., `tesseract 5.3.0`)

4. **Configure in Django:**
   - Add to your `.env` file:
   ```env
   TESSERACT_CMD=C:\Program Files\Tesseract-OCR\tesseract.exe
   ```
   - Or if Tesseract is in your PATH, you can leave this empty

### Option 2: Using Chocolatey

If you have Chocolatey installed:
```bash
choco install tesseract
```

### Option 3: Using Scoop

If you have Scoop installed:
```bash
scoop install tesseract
```

## Verify Installation

After installation, verify it works:

```bash
# Check if tesseract is in PATH
where tesseract

# Check version
tesseract --version

# Test OCR (optional)
echo "Hello World" > test.txt
# (This won't work directly, but shows the command structure)
```

## Troubleshooting

### "tesseract is not recognized"

1. **Check PATH:**
   - Open System Properties → Environment Variables
   - Check if `C:\Program Files\Tesseract-OCR\` is in your PATH
   - If not, add it and restart your terminal

2. **Use TESSERACT_CMD in .env:**
   - If PATH doesn't work, set the full path in `.env`:
   ```env
   TESSERACT_CMD=C:\Program Files\Tesseract-OCR\tesseract.exe
   ```

### Backend Still Can't Find Tesseract

The backend code now handles missing Tesseract gracefully:
- ✅ **Without Tesseract:** Uses PyMuPDF text extraction (works for text-based PDFs)
- ✅ **With Tesseract:** Full OCR support for scanned PDFs and checkbox detection

## Current Status

Your backend is configured to work **without Tesseract**. OCR features will be limited, but basic PDF text extraction will work fine.

To enable full OCR features, install Tesseract and set `TESSERACT_CMD` in your `.env` file.


