import sys
import numpy as np
from PIL import Image

input_path = sys.argv[1]
output_path = sys.argv[2]

img = Image.open(input_path).convert("RGBA")
data = np.array(img, dtype=np.float32)

r, g, b = data[:,:,0]/255, data[:,:,1]/255, data[:,:,2]/255
cmax = np.maximum(np.maximum(r, g), b)
cmin = np.minimum(np.minimum(r, g), b)
diff = cmax - cmin

hue = np.zeros_like(cmax)
mask_r = (cmax == r) & (diff > 0)
mask_g = (cmax == g) & (diff > 0)
mask_b = (cmax == b) & (diff > 0)
hue[mask_r] = (60 * ((g[mask_r] - b[mask_r]) / diff[mask_r]) + 360) % 360
hue[mask_g] = (60 * ((b[mask_g] - r[mask_g]) / diff[mask_g]) + 120) % 360
hue[mask_b] = (60 * ((r[mask_b] - g[mask_b]) / diff[mask_b]) + 240) % 360

sat = np.zeros_like(cmax)
sat[cmax > 0] = diff[cmax > 0] / cmax[cmax > 0]

green_mask = (hue >= 80) & (hue <= 160) & (sat > 0.2) & (cmax > 0.1)

result = np.array(img)
result[green_mask, 3] = 0

edge_mask = (hue >= 70) & (hue <= 170) & (sat > 0.1) & (cmax > 0.05) & ~green_mask
result[edge_mask, 3] = np.clip(result[edge_mask, 3].astype(int) - 128, 0, 255).astype(np.uint8)

out = Image.fromarray(result)
out.save(output_path)
print(f"OK {out.size[0]}x{out.size[1]}")
