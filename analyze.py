import requests
import json

url = "https://medical-image-analysis-rh8u.onrender.com/analyze-medicine"

image_path = "image.png"

files = {
    "image": open(image_path, "rb")
}

data = {
    "question": """
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
"""
}

try:
    response = requests.post(
        url,
        files=files,
        data=data
    )

    response.raise_for_status()

    result = response.json()

    print(json.dumps(result, indent=4))

finally:
    files["image"].close()