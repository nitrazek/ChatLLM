import os
import requests
from typing import NamedTuple

BASE_URL = "http://localhost:3000/api/v1/files"

class File(NamedTuple):
  id: int
  name: str

def insert_file(file_url: str, parent_folder_url: str | None):
  pass

def insert_folder(folder_url: str, parent_folder_url: str | None):
  folder_name = os.path.basename(folder_url)
  parent_folder_name = os.path.basename(parent_folder_url) if parent_folder_url is not None else None

  requests.post(
    url=f"{BASE_URL}/folders/new",
    json={
      "name": folder_name,
      ""
    }
  )

  for file in os.listdir(folder):
    abs_path = os.path.join(base_folder, file)
    if os.path.isdir(abs_path):
      print("folder")
    print(file)

def main():
  base_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), "knowledge-base-files")
  for file in os.listdir(base_folder):
    abs_path = os.path.join(base_folder, file)
    if os.path.isdir(abs_path):
      insert_folder(folder_url=file, parent_folder_url=None)
    else:
      insert_file(file_url=file, parent_folder_url=None)

if __name__ == "__main__":
  main()