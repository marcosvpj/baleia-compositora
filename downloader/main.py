import requests
import json
import time
from os import environ
from urllib.parse import urljoin

if __name__ == "__main__":
    basename = environ['NOME_BASE']
    while True:
        time.sleep(2)
        for i in range(0, 10):
            time.sleep(0.2)
            name = f"{basename}{i}"
            print(f"working on {name}")
            with open(urljoin("/out/", f"{name}.json"), 'w+') as f:
                f.write(json.dumps(
                    requests.get(
                        urljoin(environ['SERVIDOR'], name),
                        headers= {'content-type': 'application/json'}
                    ).json()) + '\n')

