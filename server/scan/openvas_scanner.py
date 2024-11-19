from gvm.connections import TLSConnection
from gvm.protocols.latest import Gmp
from gvm.transforms import EtreeTransform
from gvm.xml import pretty_print
from lxml import etree  # Import lxml for XML parsing
import time
from dotenv import load_dotenv
import os


# CVE scanner_id: 6acd0832-df90-11e4-b9d5-28d24461215b
# OpenVAS Default scanner_id: 08b69003-5fc2-4037-a479-93b440211c73

### Config IDS
# Base: d21f6c81-2b88-4ac1-b7b4-a2a9f2ad4663
# Discovery: 8715c877-47a0-438d-98a3-27c7a6ab2196
# Full and fast: daba56c8-73ec-11df-a475-002264764cea
# Host Discovery: 2d3f051c-55ba-11e3-bf43-406186ea4fc5
# Log4Shell: e3efebc5-fc0d-4cb6-b1b4-55309d0a89f6
# System Discovery: bbca7412-a950-11e3-9109-406186ea4fc5

# OpenVAS configuration
load_dotenv()
OPENVAS_HOST = '127.0.0.1'
OPENVAS_PORT = os.getenv("OPENVAS_PORT", 9390)  # OpenVAS GMP port
OPENVAS_USERNAME = os.getenv("OPENVAS_USER")  # Default admin user
OPENVAS_PASSWORD = os.getenv("OPENVAS_PASSWORD")  # Replace with your admin password

# Scan configurations
SCAN_TARGETS = [''] 
REPORT_FILE = 'openvas_report.xml'

# OpenVAS Default scanner ID
DEFAULT_SCANNER_ID = '08b69003-5fc2-4037-a479-93b440211c73'


def connect_to_openvas():
    """
    Connects to the OpenVAS server using GMP and authenticates automatically.
    """
    connection = TLSConnection(hostname=OPENVAS_HOST, port=OPENVAS_PORT)
    gmp = Gmp(connection)
    gmp.authenticate(OPENVAS_USERNAME, OPENVAS_PASSWORD)

    # Retrieve current GMP version
    version = gmp.get_version()

    # Prints the XML in beautiful form
    pretty_print(version)

    return gmp


def create_target(gmp, name, hosts):
    """
    Creates a target in OpenVAS.
    """
    try:
        # Define a port list ID (you may want to adjust this if necessary)
        port_list_id = "4a4717fe-57d2-11e1-9a26-406186ea4fc5"  # Default port list in OpenVAS (replace if needed)

        response = gmp.create_target(name=name, hosts=hosts, port_list_id=port_list_id)

        # Debug log: Output the raw response
        #print("[DEBUG] Target creation response:", pretty_print(response))

        # Parse the response into an XML tree
        response_xml = etree.fromstring(str(response))  # Convert string to XML element

        # Extract target ID using xpath
        target_id = response_xml.xpath('//create_target_response/@id')[0]
        print(f"[INFO] Target '{name}' created with ID: {target_id}")
        return target_id
    except Exception as e:
        print(f"[ERROR] Failed to create target: {e}")
        return None


def start_scan(gmp, name, target_id, scan_config_id, scanner_id):
    """
    Starts a scan with the given configuration, target, and scanner.
    """
    try:
        # Include the scanner_id in the scan task creation
        response = gmp.create_task(name=name, target_id=target_id, config_id=scan_config_id, scanner_id=scanner_id)
        
        # Debug log: Output the raw response
        #print("[DEBUG] Scan creation response:", pretty_print(response))
        
        # Parse the response into an XML object
        response_xml = etree.fromstring(str(response))  # Convert the string response to an XML element

        # Extract task ID using XPath
        task_id = response_xml.xpath('//@id')[0]
        
        print(f"[INFO] Scan task '{name}' created with ID: {task_id}")
        
        # Start the scan task
        gmp.start_task(task_id=task_id)
        print(f"[INFO] Scan task '{name}' started")
        
        return task_id
    except Exception as e:
        print(f"[ERROR] Failed to start scan: {e}")
        return None


def wait_for_scan_completion(gmp, task_id):
    """
    Waits for a scan to complete.
    """
    while True:
        try:
            # Get the task status response
            response = gmp.get_task(task_id=task_id)

            # Parse the response into an XML object
            response_xml = etree.fromstring(str(response))  # Convert string to XML element

            # Extract task status and progress
            task_status = response_xml.xpath("//task/status/text()")[0]
            task_progress = response_xml.xpath("//task/progress/text()")[0]

            print(f"[INFO] Task status: {task_status}, Progress: {task_progress}%")

            # Check if the task is done
            if task_status == "Done":
                break

            # Wait and retry
            time.sleep(30)

        except Exception as e:
            print(f"[ERROR] Failed to retrieve task status: {e}")
            break


def generate_report(gmp, task_id, output_file):
    """
    Generates a report for the given task and saves it to a file.
    """
    try:
        # Get the task information
        response = gmp.get_task(task_id=task_id)
        pretty_print(response)

        # Parse the response into an XML object
        response_xml = etree.fromstring(str(response))  # Convert string to XML element

        # Extract the report ID from the response using XPath
        report_id_elements = response_xml.xpath("//last_report/report/@id")

        # Ensure the report ID is found
        if not report_id_elements:
            print("[ERROR] No report ID found in the response.")
            return
        
        report_id = report_id_elements[0]
        
        # Fetch the report using the extracted report ID
        report = gmp.get_report(report_id=report_id, report_format_id='c402cc3e-b531-11e1-9163-406186ea4fc5')  # Default XML format

        # Save the report to the specified output file
        with open(output_file, 'w') as file:
            file.write(report)
        
        print(f"[INFO] Report saved to {output_file}")
    except Exception as e:
        print(f"[ERROR] Failed to generate report: {e}")

def list_scan_configs(gmp):
    """
    Lists all available scan configurations.
    """
    try:
        # Get all scan configurations
        response = gmp.get_scan_configs()
        pretty_print(response)
    except Exception as e:
        print(f"[ERROR] Failed to retrieve scan configurations: {e}")


if __name__ == "__main__":
    try:
        # Connect to OpenVAS
        gmp = connect_to_openvas()
        #list_scan_configs(gmp)

        # Host Discovery Scan
        
        print("[INFO] Starting Host Discovery Scan")
        discovery_target_id = create_target(gmp, "Host Discovery Target", SCAN_TARGETS)
        if discovery_target_id:
            discovery_task_id = start_scan(gmp, "Host Discovery", discovery_target_id, "2d3f051c-55ba-11e3-bf43-406186ea4fc5", DEFAULT_SCANNER_ID)
            if discovery_task_id:
                wait_for_scan_completion(gmp, discovery_task_id)
                generate_report(gmp, discovery_task_id, "host_discovery_report.xml")
            else:
                print("[ERROR] Host Discovery scan task creation failed.")
        else:
            print("[ERROR] Host Discovery target creation failed.")
        # Basic Scan
        """
        print("[INFO] Starting Basic Scan")
        basic_target_id = create_target(gmp, "Basic Scan Target", SCAN_TARGETS)
        if basic_target_id:
            basic_task_id = start_scan(gmp, "Basic Scan", basic_target_id, "daba56c8-73ec-11df-a475-002264764cea", DEFAULT_SCANNER_ID)
            if basic_task_id:
                wait_for_scan_completion(gmp, basic_task_id)
                generate_report(gmp, basic_task_id, "basic_scan_report.xml")
            else:
                print("[ERROR] Basic scan task creation failed.")
        else:
            print("[ERROR] Basic scan target creation failed.")

        # Malware Scan
        print("[INFO] Starting Malware Scan")
        malware_target_id = create_target(gmp, "Malware Scan Target", SCAN_TARGETS)
        if malware_target_id:
            malware_task_id = start_scan(gmp, "Malware Scan", malware_target_id, "bbca7412-a950-11e3-9109-406186ea4fc5", DEFAULT_SCANNER_ID)
            if malware_task_id:
                wait_for_scan_completion(gmp, malware_task_id)
                generate_report(gmp, malware_task_id, "malware_scan_report.xml")
            else:
                print("[ERROR] Malware scan task creation failed.")
        else:
            print("[ERROR] Malware scan target creation failed.")
        """
        print("[INFO] All scans completed successfully!")

    except Exception as e:
        print(f"[ERROR] An error occurred: {e}")
