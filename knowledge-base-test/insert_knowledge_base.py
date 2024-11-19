import os
import requests
from typing import NamedTuple

SUPERADMIN_LOGIN = "superadmin"
SUPERADMIN_PASSWORD = "Superadmin1!"
BASE_URL = "http://localhost:3000/api/v1"

class File(NamedTuple):
  id: int
  name: str
  path: str

def insert_file(file: File, parent_folder: File, auth_token: str):
  print(f"Inserting file {file.name}...")
  with open(file.path, "rb") as opened_file:
    requests.post(
      url=f"{BASE_URL}/files/upload{'?folderId=' + parent_folder.id if parent_folder.id is not None else ''}",
      files=opened_file,
      headers={
        "Authorization": f"Bearer {auth_token}"
      }
    )

  print()

def insert_folder(folder: File, parent_folder: File, auth_token: str, only_content: bool = False):
  if not only_content:
    print(f"Inserting folder {folder.name}...")
    insertFolderResponse = requests.post(
      url=f"{BASE_URL}/files/folders/new",
      headers={
        "Authorization": f"Bearer {auth_token}"
      },
      json={
        "name": folder.name,
        **({ "parentFolderId": parent_folder.id } if parent_folder.id is not None else {})
      },
    ).json()
    parent_folder = File(
      id=insertFolderResponse["id"],
      name=insertFolderResponse["name"],
      path=parent_folder.path
    )
    print(f"Inserted folder - {parent_folder}")
    print()
  
  for file_name in os.listdir(folder.path):
    file = File(
      id=None,
      name=file_name,
      path=os.path.join(folder.path, file_name)
    )
    if os.path.isdir(file.path):
      insert_folder(
        folder=file,
        parent_folder=folder,
        auth_token=auth_token
      )
    else:
      insert_file(
        file=file,
        parent_folder=folder,
        auth_token=auth_token
      )

def main():
  authResponse = requests.post(
    url=f"{BASE_URL}/users/login",
    json={
      "nameOrEmail": SUPERADMIN_LOGIN,
      "password": SUPERADMIN_PASSWORD
    }
  )

  print(authResponse.status_code)
  if authResponse.status_code != 200:
    print("Authentication failed")
    return

  print("Authentication successfull")
  print()
  auth_token = authResponse.json()["token"]

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
  main()