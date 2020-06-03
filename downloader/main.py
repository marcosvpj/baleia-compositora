import requests
import json
import time
import sys
from urllib.parse import urljoin

if __name__ == "__main__":
    while True:
        for i in range(0, 10):
            name = f"{sys.argv[2]}{i}"
            print(f"working on {name}")
            time.sleep(2)
            with open(urljoin("/out/", f"{name}.json"), 'w+') as f:
                json.dump(
                    requests.get(
                        urljoin(sys.argv[1], name),
                        headers= {'content-type': 'application/json'}
                    ).json(), f)
