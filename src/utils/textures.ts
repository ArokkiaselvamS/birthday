import * as THREE from "three";

/**
 * Generates a small soft radial-gradient sprite texture on a canvas.
 * Used for dust motes, embers, smoke and candle flames so we don't
 * need to ship any bitmap assets.
 */
export function makeGlowTexture(innerColor: string, outerColor: string, size = 128): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, innerColor);
  gradient.addColorStop(1, outerColor);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}
