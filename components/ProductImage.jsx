'use client';

import { useEffect, useState } from 'react';
import { getImageCandidates } from '@/lib/supabase';

export default function ProductImage({ src, alt = 'Foto produk', className = '', style, placeholder = '✿' }) {
  const candidates = getImageCandidates(src);
  const [candidateIndex, setCandidateIndex] = useState(0);

  useEffect(() => {
    setCandidateIndex(0);
  }, [src]);

  if (!candidates.length || candidateIndex >= candidates.length) {
    return <div className={`product-image-fallback ${className}`} style={style} role="img" aria-label={alt}>{placeholder}</div>;
  }

  return (
    <img
      src={candidates[candidateIndex]}
      alt={alt}
      className={className}
      style={style}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setCandidateIndex((index) => index + 1)}
    />
  );
}
