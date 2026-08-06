import {randomUUID} from 'crypto';

function generateSlug(name: string) {
  const base = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');

  const suffix = randomUUID().replace(/-/g, '').slice(0, 8);

  return `${base}-${suffix}`;
}

export default generateSlug;
