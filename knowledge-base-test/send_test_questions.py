import os
import requests
import json
import json_stream
import argparse

BASE_URL = "http://localhost:3000/api/v1"

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
  print()
  auth_token = auth_response.json()["token"]

  new_chat_response = requests.post(
    url=f"{BASE_URL}/chats/new",
    headers={ "Authorization": f"Bearer {auth_token}" },
    json={
      "name": "model_testing",
      "isUsingOnlyKnowledgeBase": True
    }
  )

  if new_chat_response.status_code != 200:
    print("Creating chat failed")
    return
  
  print("Creating chat successful")
  print()
  chat_id = new_chat_response.json()["id"]

  with open("test_questions.json", "r", encoding="utf-8") as file:
    test_questions = json.loads(file.read())

  for test_question in test_questions:
    print(f"Sending question: \"{test_question['question']}\"")
    send_question_response = requests.post(
      url=f"{BASE_URL}/chats/{chat_id}",
      headers={ "Authorization": f"Bearer {auth_token}" },
      json={
        "question": test_question["question"]
      },
      stream=True
    )

    if send_question_response.status_code != 200:
      print("Failed receiving answer")
      print()
      continue

    decoder = json.JSONDecoder()
    buffer = ""
    answer = ""
    for chunk in send_question_response.iter_content(chunk_size=8192):
      buffer += chunk.decode("utf-8")
      while buffer:
        try:
          obj, index = decoder.raw_decode(buffer)
          answer += obj["answer"]
          buffer = buffer[index:].lstrip()
        except json.JSONDecodeError:
          break
    print(f"Received answer: \"{answer}\"")
    print(f"Expected answer: \"{test_question['answer']}\"")

    print()

if __name__ == "__main__":
  parser = argparse.ArgumentParser()
  parser.add_argument("--user", "-u", required=True, type=str, help="Login of user")
  parser.add_argument("--password", "-p", required=True, type=str, help="Password of user")
  config = vars(parser.parse_args())
  
  main(config)