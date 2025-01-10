import os
from typing import List, cast

import UnityPy
import UnityPy.classes

ENV_PATH = "C:/Program Files (x86)/Steam/steamapps/common/Cult of the Lamb/Cult Of The Lamb_Data/resources.assets"
OUTPUT_DIR = "../setup/extracted"

env = UnityPy.load(ENV_PATH)
worshipper_data: bytes

class Done(Exception):
    pass

try:
    for obj in env.objects:
        if obj.type.name != "GameObject":
            continue

        data = cast(UnityPy.classes.GameObject, obj.read())
        if data.m_Name != "Worshipper Data":
            continue
        
        pairs = cast(List[UnityPy.classes.ComponentPair], data.m_Component)
        for pair in pairs:
            component = pair.component
            if component.type.name != "MonoBehaviour":
                continue
            
            worshipper_data = component.deref().get_raw_data()
            raise Done
            
except Done:
    path = os.path.join(OUTPUT_DIR, "Worshipper_Data.dat")
    with open(path, "wb") as output:
        output.write(worshipper_data)