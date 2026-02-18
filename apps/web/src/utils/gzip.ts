export async function gzipCompress(data: string): Promise<Uint8Array> {
  const cs = new CompressionStream("gzip");
  const writer = cs.writable.getWriter();
  writer.write(new TextEncoder().encode(data));
  writer.close();
  const buffer = await new Response(cs.readable).arrayBuffer();
  return new Uint8Array(buffer);
}

export async function gzipDecompress(data: Uint8Array): Promise<string> {
  const ds = new DecompressionStream("gzip");
  const writer = ds.writable.getWriter();
  writer.write(data);
  writer.close();
  return await new Response(ds.readable).text();
}

// bezier.ts
export function getBezierPoints(points: number[]) {
  if (points.length < 4) return points;

  const smooth: number[] = [];
  smooth.push(points[0], points[1]);

  for (let i = 2; i < points.length - 2; i += 2) {
    const cx = points[i];
    const cy = points[i + 1];
    const nx = (points[i] + points[i + 2]) / 2;
    const ny = (points[i + 1] + points[i + 3]) / 2;
    smooth.push(cx, cy, nx, ny);
  }

  return smooth;
}