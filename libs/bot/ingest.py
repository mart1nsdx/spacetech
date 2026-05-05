import wikipediaapi
import requests
import chromadb

WIKIPEDIA_TOPICS = [
    "Aerospace engineering",
    "Orbital mechanics",
    "Rocket propulsion",
    "Spacecraft",
    "Aerodynamics",
    "Satellite",
    "Launch vehicle",
    "Atmospheric entry",
    "Rocket engine",
    "Space exploration",
]

NASA_QUERIES = [
    "orbital mechanics introduction",
    "rocket propulsion fundamentals",
    "spacecraft structures",
    "aerodynamics basics",
    "satellite systems",
]


def fetch_wikipedia(topics: list[str]) -> list[dict]:
    wiki = wikipediaapi.Wikipedia(
        user_agent="AeroBotEducativo/1.0",
        language="en"
    )
    docs = []
    for topic in topics:
        page = wiki.page(topic)
        if page.exists():
            docs.append({
                "text": page.text[:5000],
                "source": page.fullurl,
                "topic": topic,
            })
            print(f"✓ Wikipedia: {topic}")
        else:
            print(f"✗ No encontrado: {topic}")
    return docs


def fetch_nasa_ntrs(queries: list[str]) -> list[dict]:
    docs = []
    base_url = "https://ntrs.nasa.gov/api/citations/search"
    for query in queries:
        try:
            resp = requests.get(base_url, params={"q": query, "rows": 3}, timeout=10)
            resp.raise_for_status()
            for result in resp.json().get("results", []):
                abstract = result.get("abstract", "")
                if abstract:
                    docs.append({
                        "text": abstract,
                        "source": f"https://ntrs.nasa.gov/citations/{result['id']}",
                        "topic": result.get("title", query),
                    })
            print(f"✓ NASA NTRS: {query}")
        except Exception as e:
            print(f"✗ Error NASA ({query}): {e}")
    return docs


def build_knowledge_base():
    print("Construyendo base de conocimiento...\n")

    all_docs = fetch_wikipedia(WIKIPEDIA_TOPICS) + fetch_nasa_ntrs(NASA_QUERIES)

    client = chromadb.PersistentClient(path="./knowledge_base/chroma_db")
    collection = client.get_or_create_collection("aerobot")

    collection.add(
        documents=[d["text"] for d in all_docs],
        metadatas=[{"source": d["source"], "topic": d["topic"]} for d in all_docs],
        ids=[f"doc_{i}" for i in range(len(all_docs))]
    )

    print(f"\n✅ Listo: {len(all_docs)} documentos indexados en ChromaDB")


if __name__ == "__main__":
    build_knowledge_base()
