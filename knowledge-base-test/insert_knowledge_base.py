import os
import requests
import argparse
from typing import NamedTuple

BASE_URL = "http://localhost:3000/api/v1"

class File(NamedTuple):
  id: int
  name: str
  path: str

def insert_file(file: File, parent_folder: File, auth_token: str):
  print(f"Inserting file {file.name} into {parent_folder.name}...")

  url = f"{BASE_URL}/files/upload"
  if parent_folder.id is not None:
    url += f"?folderId={parent_folder.id}"
  
  requests.post(
    url=url,
    files={ "file": (file.name, open(file.path, "rb")) },
    headers={
      "Authorization": f"Bearer {auth_token}"
    }
  )

def insert_folder(folder: File, parent_folder: File, auth_token: str, only_content: bool = False):
  inserted_folder = folder
  if not only_content:
    print(f"Inserting folder {folder.name} into {parent_folder.name}...")
    insert_folder_response = requests.post(
      url=f"{BASE_URL}/files/folders/new",
      headers={ "Authorization": f"Bearer {auth_token}" },
      json={
        "name": folder.name,
        **({ "parentFolderId": parent_folder.id } if parent_folder.id is not None else {})
      },
    ).json()
    inserted_folder = File(
      id=insert_folder_response["id"],
      name=insert_folder_response["name"],
      path=folder.path
    )
    print("Inserted folder")

  for file_name in os.listdir(inserted_folder.path):
    file = File(
      id=None,
      name=file_name,
      path=os.path.join(inserted_folder.path, file_name)
    )
    if os.path.isdir(file.path):
      insert_folder(
        folder=file,
        parent_folder=inserted_folder,
        auth_token=auth_token
      )
    else:
      insert_file(
        file=file,
        parent_folder=inserted_folder,
        auth_token=auth_token
      )

def main(config: dict[str, any]):
  auth_response = requests.post(
    url=f"{BASE_URL}/users/login",
    json={
      "nameOrEmail": config["user"],
      "password": config["password"]
    }
  )

  if auth_response.status_code != 200:
    print("Authentication failed")
    return

  print("Authentication successful")
  auth_token = auth_response.json()["token"]

  folder = File(
    id=None,
    name="knowledge-base-files",
    path=os.path.join(os.path.dirname(os.path.abspath(__file__)), "knowledge-base-files")
  )
  insert_folder(
    folder=folder,
    parent_folder=folder,
    only_content=True,
    auth_token=auth_token
  )

if __name__ == "__main__":
  parser = argparse.ArgumentParser()
  parser.add_argument("--user", "-u", required=True, type=str, help="Login of user")
  parser.add_argument("--password", "-p", required=True, type=str, help="Password of user")
  config = vars(parser.parse_args())
  
  main(config)