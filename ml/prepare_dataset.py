import os, shutil, random

src_base = "dataset/severity"

score_to_label = {
    "1": "Minor",
    "2": "Moderate",
    "3": "Severe"
}

for folder, label in score_to_label.items():
    images = os.listdir(f"{src_base}/{folder}")
    images = [f for f in images if f.endswith(".jpg")]
    random.shuffle(images)

    split = int(len(images) * 0.8)
    train_imgs = images[:split]
    val_imgs   = images[split:]

    for split_name, split_list in [("train", train_imgs), ("val", val_imgs)]:
        dest = f"datasets/severity/{split_name}/{label}"
        os.makedirs(dest, exist_ok=True)
        for img in split_list:
            shutil.copy(f"{src_base}/{folder}/{img}", f"{dest}/{img}")

    print(f"{label}: {len(train_imgs)} train, {len(val_imgs)} val")