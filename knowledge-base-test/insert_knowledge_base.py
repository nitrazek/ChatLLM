import os
import requests

def main():
  base_folder = os.path.dirname(os.path.abspath(__file__))
  files = os.listdir(os.path.join(base_folder, "knowledge-base-files"))
  print(files)

if __name__ == "__main__":
  main()