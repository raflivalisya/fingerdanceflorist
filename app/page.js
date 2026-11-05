'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase, formatImageUrl, formatCanvaEmbedUrl } from '@/lib/supabase';

const DEFAULT_CATEGORIES = [
  { name: 'Bouquet', icon: '💐', description: 'Rangkaian bunga untuk setiap momen' },
  { name: 'Flower Box', icon: '🌷', description: 'Hadiah bunga dalam box yang elegan' },
  { name: 'Special Gifts', icon: '🎁', description: 'Hadiah spesial yang dibuat dengan cinta' },
];
const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';
const money = (value) => value ? `Rp ${Number(value).toLocaleString('id-ID')}` : 'Hubungi kami';

function ProductMedia({ src, alt }) {
  const embed = formatCanvaEmbedUrl(src);
  return embed ? <iframe src={embed} title={alt} loading="lazy" allow="fullscreen" /> : <img src={formatImageUrl(src)} alt={alt} loading="lazy" />;
}

export default function Home() {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [activeSubcategory, setActiveSubcategory] = useState('Semua');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    async function loadCatalog() {
      if (!supabase) { setLoading(false); setLoadError('Hubungkan Supabase untuk menampilkan katalog.'); return; }
      const [catResult, productResult] = await Promise.all([
        supabase.from('florist_categories').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('products').select('*').order('id', { ascending: false }),
      ]);
      if (catResult.data?.length) setCategories(catResult.data);
      if (productResult.error) setLoadError('Katalog belum dapat dimuat. Periksa konfigurasi database.');
      else setProducts((productResult.data || []).filter((p) => p.is_active !== false));
      setLoading(false);
    }
    loadCatalog();
  }, []);

  const categoryName = (category) => typeof category === 'string' ? category : category?.name;
  const active = categories.find((c) => categoryName(c) === activeCategory) || categories[0];
  const categoryProducts = useMemo(() => products.filter((p) => p.category === activeCategory), [products, activeCategory]);
  const subcategories = useMemo(() => ['Semua', ...new Set(categoryProducts.map((p) => p.subcategory).filter(Boolean))], [categoryProducts]);
  const visibleProducts = categoryProducts.filter((p) => activeSubcategory === 'Semua' || p.subcategory === activeSubcategory);

  useEffect(() => { if (categories.length && !activeCategory) setActiveCategory(categoryName(categories[0])); }, [categories, activeCategory]);
  useEffect(() => { setActiveSubcategory('Semua'); }, [activeCategory]);

  const waLink = (product) => {
    const message = encodeURIComponent(`Halo Fingerdance Florist, saya tertarik dengan ${product?.name || product?.subcategory || 'produk'}${product?.price ? ` (${money(product.price)})` : ''}. Bisa minta informasi dan cara pemesanannya?`);
    return WA_NUMBER ? `https://wa.me/${WA_NUMBER.replace(/\D/g, '')}?text=${message}` : `https://wa.me/?text=${message}`;
  };

  return (
    <main className="site-shell">
      <header className="site-header">
        <a className="brand" href="#home"><span className="brand-mark">f.</span><span>fingerdance <b>florist</b><small>FLOWERS · MOMENTS · MEMORIES</small></span></a>
        <nav><a href="#home">Home</a><a href="#catalog">Collection</a><a href="#about">Our Story</a><a className="nav-cta" href={waLink(null)} target="_blank" rel="noreferrer">Contact us ↗</a></nav>
      </header>

      <section className="hero" id="home">
        <div className="hero-copy"><span className="eyebrow">A LITTLE BEAUTY, A LOT OF MEANING</span><h1>Flowers that<br/><em>speak from</em><br/>the heart.</h1><p>Setiap rangkaian punya cerita. Temukan bunga dan hadiah istimewa untuk momen yang ingin selalu dikenang.</p><a className="primary-button" href="#catalog">Explore collection <span>↗</span></a><div className="hero-note"><span className="note-line"/> HANDCRAFTED WITH LOVE</div></div>
        <div className="hero-art"><div className="hero-image"><div className="hero-image-overlay"><span>THE ART OF GIVING</span><b>Made with<br/>love, for you.</b></div></div><div className="hero-stamp">F<br/><small>F</small></div><span className="hero-side-caption">FLOWERS FOR EVERY CHAPTER · EST. WITH LOVE</span></div>
      </section>

      <section className="intro-strip" id="about"><span>01 / OUR PHILOSOPHY</span><p>Lebih dari sekadar bunga — kami merangkai perasaan menjadi sesuatu yang bisa kamu berikan.</p><span>MADE TO MAKE YOU SMILE ✳</span></section>

      <section className="catalog-section" id="catalog">
        <div className="section-heading"><div><span className="eyebrow">FIND YOUR PERFECT GIFT</span><h2>Our <em>collections.</em></h2></div><p>Temukan rangkaian yang paling sesuai<br/>dengan cerita dan momenmu.</p></div>
        <div className="category-tabs">{categories.map((cat, i) => <button key={cat.id || categoryName(cat)} className={activeCategory === categoryName(cat) ? 'category-tab active' : 'category-tab'} onClick={() => setActiveCategory(categoryName(cat))}><span>{cat.icon || ['💐','🌷','🎁'][i % 3]}</span>{categoryName(cat)}<sup>0{i + 1}</sup></button>)}</div>
        {active && <div className="category-description"><span>{active.icon || '✿'}</span><p>{active.description || `Pilihan spesial dari koleksi ${categoryName(active)} kami.`}</p></div>}
        {subcategories.length > 1 && <div className="sub-filter">{subcategories.map((sub) => <button key={sub} className={activeSubcategory === sub ? 'selected' : ''} onClick={() => setActiveSubcategory(sub)}>{sub}</button>)}</div>}
        {loading ? <div className="empty-state">Menyiapkan koleksi bunga untukmu…</div> : loadError && !products.length ? <div className="empty-state">{loadError}<small>Produk dapat dikelola setelah konfigurasi Supabase selesai.</small></div> : visibleProducts.length ? <div className="product-grid">{visibleProducts.map((product) => <button className="product-card" key={product.id} onClick={() => setSelectedProduct(product)}><div className="product-photo">{product.image ? <ProductMedia src={product.image} alt={product.name || product.subcategory || 'Fingerdance Florist'} /> : <div className="photo-placeholder">✿</div>}<span className="photo-view">VIEW DETAILS ↗</span></div><div className="product-meta"><div><span>{product.subcategory || categoryName(active)}</span><h3>{product.name || product.subcategory || 'Flower arrangement'}</h3></div><b>{money(product.price)}</b></div></button>)}</div> : <div className="empty-state">Koleksi ini sedang disiapkan.<small>Hubungi kami untuk request rangkaian custom.</small><a href={waLink(null)} target="_blank" rel="noreferrer">Tanya melalui WhatsApp ↗</a></div>}
      </section>

      <section className="closing-banner"><span className="eyebrow">LET'S MAKE IT MEMORABLE</span><h2>A thoughtful gift<br/>starts with <em>a flower.</em></h2><a className="light-button" href={waLink(null)} target="_blank" rel="noreferrer">Talk to our florist ↗</a></section>
      <footer className="site-footer"><a className="brand footer-brand" href="#home"><span className="brand-mark">f.</span><span>fingerdance <b>florist</b><small>FLOWERS · MOMENTS · MEMORIES</small></span></a><p>Merangkai keindahan, merayakan setiap cerita.</p><div><a href="#catalog">Collections</a><a href={waLink(null)} target="_blank" rel="noreferrer">WhatsApp</a><a href="/admin">Admin</a></div><small>© {new Date().getFullYear()} Fingerdance Florist. Made with love.</small></footer>
      <nav className="mobile-dock" aria-label="Navigasi utama"><a href="#home"><span>⌂</span><small>Home</small></a><a href="#catalog"><span>✿</span><small>Collection</small></a><a href={waLink(null)} target="_blank" rel="noreferrer"><span>♡</span><small>Contact</small></a><a href="/admin"><span>⌘</span><small>Admin</small></a></nav>

      {selectedProduct && <div className="modal-backdrop" onClick={() => setSelectedProduct(null)}><div className="product-modal" onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={() => setSelectedProduct(null)}>×</button>{selectedProduct.image && <div className="modal-media"><ProductMedia src={selectedProduct.image} alt={selectedProduct.name || 'Produk'} /></div>}<div className="modal-info"><span className="eyebrow">{selectedProduct.subcategory || selectedProduct.category}</span><h2>{selectedProduct.name || selectedProduct.subcategory}</h2><strong>{money(selectedProduct.price)}</strong><p>{selectedProduct.description || 'Rangkaian spesial yang dibuat dengan penuh perhatian. Hubungi kami untuk detail dan pilihan custom.'}</p><a className="primary-button" href={waLink(selectedProduct)} target="_blank" rel="noreferrer">Order via WhatsApp ↗</a></div></div></div>}
    </main>
  );
}
