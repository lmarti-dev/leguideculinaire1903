import os
import io
import json
from pathlib import Path

def load_json(fpath):
    with io.open(fpath,"r",encoding="utf8") as f:
        jobj = json.loads(f.read())
    return jobj 
def save_json(jobj,fpath):
        with io.open(fpath,"w+",encoding="utf8") as f:
            f.write(json.dumps(jobj,ensure_ascii=False))


def add_pk(jobj):
    out = []
    pk=0
    for elem in jobj:
        elem["pk"]=pk
        pk+=1
        out.append(elem)
    return out

if __name__ == "__main__":
     
    a = r"c:\Users\Moi4\Desktop\code\web\escoffier_webbook\data\recipes_merged.json"
    b=  r"c:\Users\Moi4\Desktop\code\web\escoffier_webbook\data\articles_merged.json"
    c = r"c:\Users\Moi4\Desktop\code\web\escoffier_webbook\data\intros_merged.json"

    for fpath in (a,b,c):
         jobj = load_json(fpath)
         out = add_pk(jobj)
         out_fpath = Path(Path(fpath).parent,Path(fpath).stem + "_pk.json")
         print(out_fpath)
         save_json(out,out_fpath)
         