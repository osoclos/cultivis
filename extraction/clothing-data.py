import os
from typing import List, cast

import UnityPy
import UnityPy.classes

ENV_PATH = "C:/Program Files (x86)/Steam/steamapps/common/Cult of the Lamb/Cult Of The Lamb_Data/resources.assets"
OUTPUT_DIR = "../setup/extracted/data/clothing"

env = UnityPy.load(ENV_PATH)
for obj in env.objects:
    if obj.type.name != "MonoBehaviour":
        continue

    data = cast(UnityPy.classes.MonoBehaviour, obj.read(check_read=False))
    script = cast(UnityPy.classes.PPtr, data.m_Script)
    if script.m_PathID != 2509: # Data/Equipment Data/Clothing
        continue

    raw_data = obj.get_raw_data()
    path = os.path.join(OUTPUT_DIR, f"{data.m_Name}.dat")
    
    with open(path, "wb") as output:
        output.write(raw_data)