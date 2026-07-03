from collections import deque
from pathlib import Path
import math

from PIL import Image


src = Path("assets/bank-tulang-logo.jpeg")
out = Path("assets/bank-tulang-logo-transparent.png")
img = Image.open(src).convert("RGBA")
w, h = img.size
pix = img.load()

samples = []
for x, y in [
    (0, 0),
    (w - 1, 0),
    (0, h - 1),
    (w - 1, h - 1),
    (w // 2, 0),
    (w // 2, h - 1),
    (0, h // 2),
    (w - 1, h // 2),
]:
    r, g, b, _ = pix[x, y]
    samples.append((r, g, b))

bg = tuple(round(sum(c[i] for c in samples) / len(samples)) for i in range(3))


def dist(color):
    return math.sqrt(sum((color[i] - bg[i]) ** 2 for i in range(3)))


visited = bytearray(w * h)
queue = deque()

for x in range(w):
    queue.append((x, 0))
    queue.append((x, h - 1))
for y in range(h):
    queue.append((0, y))
    queue.append((w - 1, y))

hard_threshold = 30
soft_threshold = 82

while queue:
    x, y = queue.popleft()
    if x < 0 or y < 0 or x >= w or y >= h:
        continue

    index = y * w + x
    if visited[index]:
        continue

    r, g, b, _ = pix[x, y]
    if dist((r, g, b)) > soft_threshold or min(r, g, b) < 205:
        continue

    visited[index] = 1
    queue.append((x + 1, y))
    queue.append((x - 1, y))
    queue.append((x, y + 1))
    queue.append((x, y - 1))

for y in range(h):
    for x in range(w):
        index = y * w + x
        if not visited[index]:
            continue

        r, g, b, _ = pix[x, y]
        distance = dist((r, g, b))
        alpha = 0 if distance <= hard_threshold else int(
            255 * min(1, (distance - hard_threshold) / (soft_threshold - hard_threshold))
        )
        pix[x, y] = (r, g, b, alpha)

img.save(out)
print(f"{out} {img.size} bg={bg}")
