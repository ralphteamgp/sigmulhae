/**
 * In-memory 1x1 PNG for setInputFiles() — no filesystem dependency.
 */
export const png1x1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9WmM9xkAAAAASUVORK5CYII=',
  'base64',
);

export function createUploadFile(name = 'window-sample.png') {
  return {
    name,
    mimeType: 'image/png',
    buffer: png1x1,
  };
}
