import io
import json

jobj = json.loads(
    io.open(
        r"c:\projects\typographie_dictionnaires_langage\escoffier_webbook\data\recipes_merged.json",
        "r",
        encoding="utf8",
    ).read()
)


with_citron = 0
without_citron = 0
for item in jobj:
    if "mayonnaise" in item["text"].lower():
        if "citron" in item["text"].lower():
            with_citron += 1
        else:
            without_citron += 1


print(f"with: {with_citron} without: {without_citron}")
