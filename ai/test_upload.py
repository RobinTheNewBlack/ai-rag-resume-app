import requests
import json
import sys

# Create a dummy PDF file
with open("dummy.pdf", "wb") as f:
    f.write(b"%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF")

url = "http://localhost:8000/api/resumes/upload"
files = {'file': ('dummy.pdf', open('dummy.pdf', 'rb'), 'application/pdf')}
data = {'job_id': 1} # Assuming job_id 1 exists

response = requests.post(url, files=files, data=data)
print("Status Code:", response.status_code)
print("Response Body:", response.text)
