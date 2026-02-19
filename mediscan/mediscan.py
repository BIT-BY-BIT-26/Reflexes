"""
mediscan.py  ←  YAHAN SE CHALAO
─────────────────────────────────
MediScan - Automated Medicine Text Extractor
Python + OpenCV + Tesseract OCR

Usage:
    python mediscan.py                      # Interactive menu
    python mediscan.py --image path.jpg     # Single image
    python mediscan.py --folder ./images    # Batch folder
    python mediscan.py --camera             # Live webcam
    python mediscan.py --image x.jpg --output ./my_results
"""

import cv2
import os
import time
import argparse
from datetime import datetime

from ocr_engine   import extract_text, get_word_boxes
from preprocessor import draw_boxes_on_image
from analyzer     import analyze_medicine
from reporter     import save_json, generate_html_report
from camera       import live_camera_mode


# ─────────────────────────────────────────────
def process_single_image(image_path, save_output=True, output_dir="output_results"):
    """Ek image process karo - OCR + analysis + annotated image."""

    print(f"\n{'='*55}")
    print(f"  Processing: {os.path.basename(image_path)}")
    print(f"{'='*55}")

    if not os.path.exists(image_path):
        print(f"  ❌ File nahi mili: {image_path}")
        return None

    img = cv2.imread(image_path)
    if img is None:
        print(f"  ❌ Image read nahi hui (corrupt ho sakti hai)")
        return None

    print(f"  📐 Size: {img.shape[1]}x{img.shape[0]} px")
    print("  🔍 Text extract ho raha hai...")

    start = time.time()
    text  = extract_text(img)
    elapsed = round(time.time() - start, 2)

    print(f"  ⏱  {elapsed} seconds lage")

    if not text:
        print("  ⚠️  Koi text nahi mila — better lighting ya closer photo try karo")
        return None

    print(f"\n  📄 Extracted Text:\n  {'─'*45}")
    for line in text.split('\n'):
        if line.strip():
            print(f"  | {line}")
    print(f"  {'─'*45}")

    info = analyze_medicine(text)
    print(f"\n  💊 Medicine Info:")
    print(f"     Name         : {info['possible_name'] or 'N/A'}")
    print(f"     Dosage       : {info['dosage']        or 'N/A'}")
    print(f"     Expiry       : {info['expiry']        or 'N/A'}")
    print(f"     Batch        : {info['batch']         or 'N/A'}")
    print(f"     Manufacturer : {info['manufacturer']  or 'N/A'}")

    result = {
        "file"               : image_path,
        "filename"           : os.path.basename(image_path),
        "timestamp"          : datetime.now().isoformat(),
        "raw_text"           : text,
        "medicine_info"      : info,
        "processing_time_sec": elapsed,
    }

    if save_output:
        os.makedirs(output_dir, exist_ok=True)
        word_data = get_word_boxes(img)
        if word_data:
            annotated = draw_boxes_on_image(img, word_data)
            base      = os.path.splitext(os.path.basename(image_path))[0]
            out_path  = os.path.join(output_dir, f"{base}_annotated.jpg")
            cv2.imwrite(out_path, annotated)
            result["annotated_image"] = out_path
            print(f"\n  ✅ Annotated image saved: {out_path}")

    return result


# ─────────────────────────────────────────────
def process_folder(folder_path, output_dir="output_results"):
    """Folder ke saare images batch mein process karo."""

    extensions = ('.jpg', '.jpeg', '.png', '.bmp', '.webp', '.tiff', '.tif')
    files = [f for f in os.listdir(folder_path)
             if f.lower().endswith(extensions)]

    if not files:
        print(f"❌ '{folder_path}' mein koi image nahi mili")
        return []

    print(f"\n🗂  {len(files)} images mili: {folder_path}")
    all_results = []

    for i, fname in enumerate(files, 1):
        print(f"\n[{i}/{len(files)}]", end="")
        path   = os.path.join(folder_path, fname)
        result = process_single_image(path, save_output=True, output_dir=output_dir)
        if result:
            all_results.append(result)

    print(f"\n\n{'='*55}")
    print(f"  ✅ Done! {len(all_results)}/{len(files)} images processed")
    print(f"{'='*55}")

    save_json(all_results, output_dir)
    generate_html_report(all_results, output_dir)

    return all_results


# ─────────────────────────────────────────────
def interactive_mode():
    """Simple terminal menu."""

    print("\n" + "═"*55)
    print("  💊  MEDISCAN — Medicine Text Extractor")
    print("      Python + OpenCV + Tesseract OCR")
    print("═"*55)

    while True:
        print("\n📋 Kya karna hai?")
        print("  [1] Single image process karo")
        print("  [2] Folder batch process karo")
        print("  [3] Live camera mode")
        print("  [0] Exit")

        choice = input("\n> Choice: ").strip()

        if choice == '1':
            path = input("  Image path dalo: ").strip().strip('"')
            if path:
                process_single_image(path, save_output=True)

        elif choice == '2':
            folder = input("  Folder path dalo: ").strip().strip('"')
            if folder:
                process_folder(folder)

        elif choice == '3':
            live_camera_mode(
                ocr_fn=lambda frame: extract_text(frame)
            )

        elif choice == '0':
            print("\n👋 Bye!\n")
            break

        else:
            print("  ❌ Invalid choice, dobara try karo")


# ─────────────────────────────────────────────
if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description='MediScan - Medicine Image Text Extractor'
    )
    parser.add_argument('--image',  '-i', type=str, help='Single image path')
    parser.add_argument('--folder', '-f', type=str, help='Folder with images')
    parser.add_argument('--camera', '-c', action='store_true', help='Live camera')
    parser.add_argument('--output', '-o', type=str,
                        default='output_results', help='Output folder')
    args = parser.parse_args()

    if args.image:
        process_single_image(args.image, save_output=True, output_dir=args.output)
    elif args.folder:
        process_folder(args.folder, output_dir=args.output)
    elif args.camera:
        live_camera_mode(ocr_fn=lambda frame: extract_text(frame))
    else:
        interactive_mode()
