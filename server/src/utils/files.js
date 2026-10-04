// Validate real file contents (magic bytes), not just the client-supplied mimetype.
export const isPdf = (buf) => buf?.length > 4 && buf.subarray(0, 5).toString('latin1') === '%PDF-';

export const isImage = (buf) => {
  if (!buf || buf.length < 12) return false;
  const jpeg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  const png = buf[0] === 0x89 && buf.subarray(1, 4).toString('latin1') === 'PNG';
  const gif = buf.subarray(0, 3).toString('latin1') === 'GIF';
  const webp = buf.subarray(0, 4).toString('latin1') === 'RIFF' && buf.subarray(8, 12).toString('latin1') === 'WEBP';
  return jpeg || png || gif || webp;
};
