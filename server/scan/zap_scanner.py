from zapv2 import ZAPv2
import time
from dotenv import load_dotenv
import os


load_dotenv()
ZAP_API_KEY = os.getenv("ZAP_API_KEY")
ZAP_BASE_URL = os.getenv("ZAP_BASE_URL") 

# Target application URL
TARGET_URL = ''

# Initialize ZAP API client
zap = ZAPv2(apikey=ZAP_API_KEY, proxies={'http': ZAP_BASE_URL, 'https': ZAP_BASE_URL})


def start_passive_scan(target_url):
    """
    Starts the passive scan by accessing the target URL.
    """
    print(f"[INFO] Starting Passive Scan for: {target_url}")
    zap.urlopen(target_url)  # Access the target URL
    time.sleep(2)  # Allow time for the passive scanner to analyze the request
    print(f"[INFO] Passive Scan Complete")


def start_active_scan(target_url):
    """
    Starts an active scan on the target URL.
    """
    print(f"[INFO] Starting Active Scan for: {target_url}")
    scan_id = zap.ascan.scan(target_url)
    while int(zap.ascan.status(scan_id)) < 100:
        print(f"[INFO] Active Scan Progress: {zap.ascan.status(scan_id)}%")
        time.sleep(5)
    print(f"[INFO] Active Scan Complete")


def generate_report(output_file_html='zap_report.html', output_file_json='zap_report.json'):
    """
    Generates a vulnerability report and saves it to a file.
    """
    print(f"[INFO] Generating HTML Report")
    with open(output_file_html, 'w') as report_file:
        report_file.write(zap.core.htmlreport())
    print(f"[SAVED] Report saved to {output_file_html}")

    print(f"[INFO] Generating JSON Report")
    with open(output_file_json, 'w') as report_file:
        report_file.write(zap.core.jsonreport())  # Change to jsonreport() for JSON output
    print(f"[SAVED] Report saved to {output_file_json}")


def zap_scan(target_url):
    """
    Initiates a full scan using ZAP.
    """
    try:
        # Passive Scan
        start_passive_scan(target_url)

        # Active Scan
        start_active_scan(target_url)

        # Generate Report
        generate_report()
        print("[SUCCESS] Scanning Completed Successfully!")
        return zap.core.jsonreport()

    except Exception as e:
        print(f"[ERROR] An error occurred: {e}")
        return {"error": str(e)}


if __name__ == "__main__":
    try:
        # Passive Scan
        start_passive_scan(TARGET_URL)

        # Active Scan
        start_active_scan(TARGET_URL)

        # Generate Report
        generate_report()

        print("[SUCCESS] Scanning Completed Successfully!")

    except Exception as e:
        print(f"[ERROR] An error occurred: {e}")
