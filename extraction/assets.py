import os
import glob
from typing import cast

import UnityPy
import UnityPy.classes
import UnityPy.files

ENV_DIR = "C:/Program Files (x86)/Steam/steamapps/common/Cult of the Lamb/Cult Of The Lamb_Data"
OUTPUT_DIR = "setup/extracted/assets"

class Done:
    pass

texture_locations = dict[str, set[str]]()
for root, _, files in os.walk(ENV_DIR):
    for filename in files:
        env_path = os.path.join(root, filename)
        env = UnityPy.load(env_path)

        for obj in env.objects:
            if obj.type.name == "TextAsset":
                data = cast(UnityPy.classes.TextAsset, obj.read())
                path = os.path.join(OUTPUT_DIR, data.m_Name)
                if os.path.exists(path):
                    continue

                print(f"Extracting {data.m_Name} from {env_path}")
                with open(path, "wb") as output:
                    output.write(data.m_Script.encode("utf-8", "surrogateescape"))

                continue

            if obj.type.name != "Texture2D":
                continue

            data = cast(UnityPy.classes.Texture2D, obj.read())
            texture_locations[data.m_Name] = env_path

atlas_textures = dict[str, set[str]]()
lost_textures = set[str]()

for atlas in glob.glob(f"{OUTPUT_DIR}/*.atlas"):
    for line in open(atlas, "rt"):
        line = line.strip()
        if not line.endswith(".png"):
            continue

        name = line.replace(".png", "")
        if name not in texture_locations:
            print(f"{line}'s location is missing. Will search all files")
            lost_textures.add(name)

            continue

        path = texture_locations[name]
        if path in atlas_textures:
            print(f"{line} is located in {path}")
            atlas_textures[path].add(name)
            continue

        atlas_textures[path] = set([name])

for root, _, files in os.walk(ENV_DIR):
    for filename in files:
        env_path = os.path.join(root, filename)
        env = UnityPy.load(env_path)

        if env_path in atlas_textures:
            textures = atlas_textures[env_path]
            for obj in env.objects:
                if obj.type.name != "Texture2D":
                    continue

                data = cast(UnityPy.classes.Texture2D, obj.read())
                if data.m_Name not in textures.union(lost_textures):
                    continue

                if data.m_Name in textures:
                    textures.remove(data.m_Name)

                if data.m_Name in lost_textures:
                    lost_textures.remove(data.m_Name)

                filename = f"{data.m_Name}.png"
                path = os.path.join(OUTPUT_DIR, filename)

                if os.path.exists(path):
                    path = os.path.join(OUTPUT_DIR, f"{data.m_Name}-{filename}.png")

                print(f"Extracting {filename} from {env_path}")
                data.image.save(path)

            if len(textures) > 0:
                print(f"Some textures cannot be found in {env_path}: {textures}")

if len(lost_textures) > 0:
    print(f"Some textures cannot be found: {lost_textures}")

print("Extraction of assets has been completed")
