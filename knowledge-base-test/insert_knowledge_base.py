import os
import requests
from typing import NamedTuple

BASE_URL = "http://localhost:3000/api/v1/files"

class File(NamedTuple):
  id: int
  name: str
  path: str

def insert_file(file: File, parent_folder: File):
  with open(file.path, "rb") as opened_file:
    requests.post(
      url=f"{BASE_URL}/upload{'?folderId=' + parent_folder.id if parent_folder.id is not None else ''}",
      files=opened_file
    )

def insert_folder(folder: File, parent_folder: File, only_content: bool = False):
  if not only_content:
    insertFolderResponse = requests.post(
      url=f"{BASE_URL}/folders/new",
      json={
        "name": folder.name,
        "parentFolderId": parent_folder.id
      }
    ).json
    parent_folder = File(
      id=insertFolderResponse.id,
      name=insertFolderResponse.name,
      path=parent_folder.path
    )
  
  for file in os.listdir(folder.path):
    file = File(
      id=None,
      name=file,
      path=os.path.join(folder.path, file.name)
    )
    if os.path.isdir(file.path):
      insert_folder(
        folder=file,
        parent_folder=folder
      )
    else:
      insert_file(
        file=file,
        parent_folder=folder
      )

def main():
  folder = File(
    id=None,
    name="knowledge-base-files",
    path=os.path.join(os.path.dirname(os.path.abspath(__file__)), "knowledge-base-files")
  )
  insert_folder(
    folder=folder,
    parent_folder=folder,
    only_content=True
  )

if __name__ == "__main__":
  main()