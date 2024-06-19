System inteligentnej bazy wiedzy wykorzystującej interfejs w języku naturalnym.

# Zmienne środowiskowe:
- PORT: port na którym uruchomiony jest serwer (domyślnie 3000)
- OLLAMA_URL: url do serwera Ollamy (domyślnie http://localhost:11434)
- OLLAMA_MODEL: model LLM w Ollamie (domyślnie llama2)
- CHROMA_URL: url do serwera ChromaDB (domyślnie http://localhost:9001)
- CHROMA_COLLECTION_NAME: nazwa kolekcji/bazy na serwerze ChromaDB (domyślnie knowledge-base)

# Dokumentacja OpenAPI:
- uruchamiasz serwer poleceniem "npm run dev" (w trybie developera) lub "npm run build" i "npm run serve" (w trybie produkcyjnym)
- wchodzisz na adres [server_url]/api/v1/documentation

# Aplikacja webowa:
- uruchamiasz aplikację poleceniem "npm start"
- aplikacja uruchamia się pod adresem localhost:80