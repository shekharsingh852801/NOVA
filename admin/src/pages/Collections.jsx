import { useEffect, useMemo, useState } from 'react';
import { adminApi, resolveUploadedMediaUrl } from '../services/adminApi.js';

const previewSizes = [
  { id: 'desktop', label: 'Desktop', width: '1280px', height: '900px' },
  { id: 'tablet', label: 'Tablet', width: '768px', height: '1100px' },
  { id: 'mobile', label: 'Mobile', width: '390px', height: '1300px' },
];
const storefrontUrl = import.meta.env.VITE_STOREFRONT_URL || `${window.location.protocol}//${window.location.hostname}:5173`;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function defaultProductSlugs(collectionSlug, catalog) {
  if (collectionSlug === 'everyday-uniform') {
    return catalog.filter((product) => product.bestSeller).map((product) => product.slug);
  }
  if (collectionSlug === 'soft-structure') {
    return catalog.filter((product) => product.category === 'Women').map((product) => product.slug);
  }
  return catalog.filter((product) => product.featured).slice(0, 6).map((product) => product.slug);
}

function TextField({ label, value, onChange, multiline = false, placeholder = '', readOnly = false }) {
  return (
    <label className="homepage-field">
      <span>{label}</span>
      {multiline
        ? <textarea value={value ?? ''} placeholder={placeholder} rows={4} onChange={(event) => onChange(event.target.value)} />
        : <input value={value ?? ''} placeholder={placeholder} readOnly={readOnly} onChange={(event) => onChange(event.target.value)} />}
    </label>
  );
}

function ImageField({ value, onChange, onUpload }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function upload(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setError('');
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be 5 MB or smaller.');
      return;
    }

    setUploading(true);
    try {
      onChange(await onUpload(file));
    } catch (uploadError) {
      setError(uploadError.message || 'Image upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="homepage-image-field">
      <TextField label="Collection image URL" value={value} onChange={onChange} placeholder="/uploads/image.webp or https://..." />
      <label className="homepage-upload-button">
        {uploading ? 'Uploading…' : 'Upload image (max 5 MB)'}
        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={upload} disabled={uploading} />
      </label>
      {value && <img className="homepage-image-preview" src={resolveUploadedMediaUrl(value)} alt="" onError={() => setError('Image could not be displayed. Check that the image URL is reachable.')} />}
      {error && <p className="homepage-error">{error}</p>}
    </div>
  );
}

export default function Collections() {
  const [draft, setDraft] = useState(null);
  const [saved, setSaved] = useState(null);
  const [products, setProducts] = useState([]);
  const [activeId, setActiveId] = useState('page');
  const [productSearch, setProductSearch] = useState('');
  const [productCategory, setProductCategory] = useState('All');
  const [previewSize, setPreviewSize] = useState('desktop');
  const [previewToken, setPreviewToken] = useState('');
  const [publishedAt, setPublishedAt] = useState(null);
  const [hasPersistedDraft, setHasPersistedDraft] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [uploadsInProgress, setUploadsInProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [page, catalog] = await Promise.all([adminApi.getCollectionPage(), adminApi.getProducts()]);
        if (!active) return;
        const content = clone(page.draft);
        content.collections = content.collections.map((collection) => ({
          ...collection,
          productSlugs: collection.productSlugs ?? defaultProductSlugs(collection.slug, catalog),
        }));
        setProducts(catalog);
        setDraft(content);
        setSaved(clone(content));
        setPublishedAt(page.publishedAt);
        setHasPersistedDraft(page.hasDraft);
        if (page.hasDraft) {
          const { token } = await adminApi.createCollectionPagePreview();
          if (active) setPreviewToken(token);
        }
      } catch (loadError) {
        if (active) setError(loadError.message || 'Could not load collection page content');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  const hasChanges = useMemo(
    () => draft && saved && JSON.stringify(draft) !== JSON.stringify(saved),
    [draft, saved],
  );
  const activeCollectionIndex = draft?.collections.findIndex((item) => item.slug === activeId) ?? -1;
  const activeCollection = activeCollectionIndex >= 0 ? draft.collections[activeCollectionIndex] : null;
  const productCategories = [...new Set(products.map((product) => product.category).filter(Boolean))].sort();
  const filteredProducts = products.filter((product) => (
    (productCategory === 'All' || product.category === productCategory)
    && `${product.name} ${product.category} ${product.subcategory}`.toLowerCase().includes(productSearch.trim().toLowerCase())
  ));
  const activePreviewSize = previewSizes.find((size) => size.id === previewSize) || previewSizes[0];
  const previewUrl = useMemo(() => {
    if (!previewToken) return '';
    const target = new URL(storefrontUrl);
    target.searchParams.set('collectionPreview', previewToken);
    target.hash = '/collections';
    return target.toString();
  }, [previewToken]);

  useEffect(() => {
    if (!hasChanges) return undefined;
    const warnBeforeLeaving = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warnBeforeLeaving);
    return () => window.removeEventListener('beforeunload', warnBeforeLeaving);
  }, [hasChanges]);

  function updatePage(patch) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function updateCollection(index, patch) {
    setDraft((current) => ({
      ...current,
      collections: current.collections.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item),
    }));
  }

  function moveCollection(index, direction) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= draft.collections.length) return;
    const collections = [...draft.collections];
    [collections[index], collections[targetIndex]] = [collections[targetIndex], collections[index]];
    setDraft((current) => ({ ...current, collections }));
  }

  function toggleProduct(productSlug, checked) {
    const selected = activeCollection.productSlugs;
    const productSlugs = checked
      ? [...selected, productSlug]
      : selected.filter((slug) => slug !== productSlug);
    updateCollection(activeCollectionIndex, { productSlugs });
  }

  async function upload(file) {
    setUploadsInProgress((count) => count + 1);
    try {
      return (await adminApi.uploadHomepageMedia(file)).url;
    } finally {
      setUploadsInProgress((count) => count - 1);
    }
  }

  async function saveDraft(content = draft) {
    const contentToSave = clone(content);
    setBusy('save');
    setError('');
    setMessage('');
    try {
      const result = await adminApi.saveCollectionPageDraft(contentToSave);
      setSaved(clone(result.draft));
      setDraft((current) => JSON.stringify(current) === JSON.stringify(contentToSave) ? clone(result.draft) : current);
      setHasPersistedDraft(true);
      try {
        const { token } = await adminApi.createCollectionPagePreview();
        setPreviewToken(token);
      } catch (previewError) {
        setError(`Draft saved, but the live preview could not be refreshed: ${previewError.message || 'Preview token request failed'}`);
      }
      setMessage('Draft saved. It is not live until published.');
    } catch (saveError) {
      setError(saveError.message || 'Could not save the collection page draft');
    } finally {
      setBusy('');
    }
  }

  async function publish() {
    const contentToPublish = clone(draft);
    setBusy('publish');
    setError('');
    setMessage('');
    try {
      const savedDraft = await adminApi.saveCollectionPageDraft(contentToPublish);
      setSaved(clone(savedDraft.draft));
      setDraft((current) => JSON.stringify(current) === JSON.stringify(contentToPublish) ? clone(savedDraft.draft) : current);
      setHasPersistedDraft(true);
      const result = await adminApi.publishCollectionPage();
      setPublishedAt(result.publishedAt);
      try {
        const { token } = await adminApi.createCollectionPagePreview();
        setPreviewToken(token);
      } catch (previewError) {
        setError(`Collection page published, but the draft preview could not be refreshed: ${previewError.message || 'Preview token request failed'}`);
      }
      setMessage('Collection page published successfully.');
    } catch (publishError) {
      setError(publishError.message || 'Could not publish the collection page');
    } finally {
      setBusy('');
    }
  }

  async function preview() {
    setBusy('preview');
    setError('');
    setMessage('');
    const previewWindow = window.open('', '_blank');
    if (!previewWindow) {
      setError('Allow pop-ups to open the storefront preview.');
      setBusy('');
      return;
    }
    previewWindow.opener = null;
    try {
      if (hasChanges || !hasPersistedDraft) {
        const result = await adminApi.saveCollectionPageDraft(clone(draft));
        setSaved(clone(result.draft));
        setDraft((current) => JSON.stringify(current) === JSON.stringify(draft) ? clone(result.draft) : current);
        setHasPersistedDraft(true);
      }
      const { token } = await adminApi.createCollectionPagePreview();
      const target = new URL(storefrontUrl);
      target.searchParams.set('collectionPreview', token);
      target.hash = '/collections';
      previewWindow.location.replace(target.toString());
    } catch (previewError) {
      previewWindow.close();
      setError(previewError.message || 'Could not open the storefront preview');
    } finally {
      setBusy('');
    }
  }

  async function refreshPreview() {
    setBusy('refresh');
    setError('');
    try {
      if (hasChanges || !hasPersistedDraft) {
        const result = await adminApi.saveCollectionPageDraft(clone(draft));
        setSaved(clone(result.draft));
        setDraft((current) => JSON.stringify(current) === JSON.stringify(draft) ? clone(result.draft) : current);
        setHasPersistedDraft(true);
      }
      const { token } = await adminApi.createCollectionPagePreview();
      setPreviewToken(token);
    } catch (previewError) {
      setError(previewError.message || 'Could not refresh the collection page preview');
    } finally {
      setBusy('');
    }
  }

  function discardChanges() {
    if (!saved || !window.confirm('Discard all unsaved collection page changes?')) return;
    setDraft(clone(saved));
    setMessage('Unsaved changes discarded.');
    setError('');
  }

  if (loading) return <div className="loading-shell">Loading collection page content…</div>;
  if (!draft) return <div className="admin-card"><p className="homepage-error">{error}</p></div>;

  return (
    <div className="homepage-editor collection-page-editor">
      <header className="homepage-editor__header">
        <div className="homepage-editor__heading">
          <div className="homepage-editor__title">
            <div>
              <p className="eyebrow">Storefront / Content</p>
              <h2>Collections page</h2>
              <p>Edit the landing page linked from the storefront navigation.</p>
            </div>
            <span className={`homepage-save-indicator ${hasChanges ? 'is-dirty' : ''}`}>
              <span aria-hidden="true" />
              {hasChanges ? 'Unsaved changes' : hasPersistedDraft ? 'Draft saved' : 'Not saved yet'}
            </span>
          </div>
          <div className="homepage-editor__stats">
            <span><strong>{draft.collections.length}</strong> collection cards</span>
            <span>{publishedAt ? `Live since ${new Date(publishedAt).toLocaleDateString()}` : 'Not published'}</span>
          </div>
        </div>
        <div className="homepage-editor__actions">
          {hasChanges && <button type="button" className="ghost-button homepage-action-discard" onClick={discardChanges} disabled={Boolean(busy) || uploadsInProgress > 0}>Discard</button>}
          <button type="button" className="ghost-button homepage-action-preview" onClick={preview} disabled={Boolean(busy) || uploadsInProgress > 0}>{busy === 'preview' ? 'Preparing preview…' : 'Preview'}</button>
          <button type="button" className="ghost-button homepage-action-save" onClick={() => saveDraft()} disabled={Boolean(busy) || uploadsInProgress > 0 || (!hasChanges && hasPersistedDraft)}>{busy === 'save' ? 'Saving…' : 'Save draft'}</button>
          <button type="button" className="primary-button homepage-action-publish" onClick={publish} disabled={Boolean(busy) || uploadsInProgress > 0}>{busy === 'publish' ? 'Publishing…' : 'Publish'}</button>
        </div>
      </header>
      {uploadsInProgress > 0 && <p className="homepage-editor__upload-status" role="status">Image upload in progress. Save and publish are paused until it finishes.</p>}
      {error && <p className="homepage-error" role="alert">{error}</p>}
      {message && <p className="homepage-success" role="status">{message}</p>}

      <div className="homepage-workspace">
        <aside className="homepage-section-nav" aria-label="Collection page content">
          <div className="homepage-section-nav__heading">
            <div><span className="eyebrow">Page structure</span><h3>Content</h3></div>
            <span>{draft.collections.length + 1}</span>
          </div>
          <ol>
            <li>
              <button type="button" className={`homepage-section-nav__item ${activeId === 'page' ? 'is-active' : ''}`} onClick={() => setActiveId('page')} aria-current={activeId === 'page' ? 'step' : undefined}>
                <span className="homepage-section-nav__number">01</span>
                <span className="homepage-section-nav__label"><strong>Page introduction</strong><small>Heading and description</small></span>
              </button>
            </li>
            {draft.collections.map((item, index) => (
              <li key={item.slug}>
                <button type="button" className={`homepage-section-nav__item ${activeId === item.slug ? 'is-active' : ''}`} onClick={() => setActiveId(item.slug)} aria-current={activeId === item.slug ? 'step' : undefined}>
                  <span className="homepage-section-nav__number">{String(index + 2).padStart(2, '0')}</span>
                  <span className="homepage-section-nav__label"><strong>{item.title}</strong><small>Collection card</small></span>
                </button>
              </li>
            ))}
          </ol>
          <p className="homepage-section-nav__note">Collection slugs stay fixed so every card continues to open its existing collection page.</p>
        </aside>

        <section className="homepage-section-editor" aria-labelledby="collection-editor-title">
          {activeId === 'page' ? (
            <>
              <header className="homepage-section-editor__header">
                <div><span className="homepage-section-editor__position">PAGE INTRODUCTION</span><h3 id="collection-editor-title">Collections page heading</h3><p>Update the introduction shown above all collection cards.</p></div>
              </header>
              <div className="homepage-section-editor__body homepage-fields">
                <TextField label="Eyebrow" value={draft.eyebrow} onChange={(value) => updatePage({ eyebrow: value })} />
                <TextField label="Page title" value={draft.title} onChange={(value) => updatePage({ title: value })} />
                <TextField label="Description" value={draft.description} onChange={(value) => updatePage({ description: value })} multiline />
              </div>
            </>
          ) : activeCollection ? (
            <>
              <header className="homepage-section-editor__header">
                <div><span className="homepage-section-editor__position">COLLECTION {String(activeCollectionIndex + 1).padStart(2, '0')} OF {String(draft.collections.length).padStart(2, '0')}</span><h3 id="collection-editor-title">{activeCollection.title}</h3><p>Manage this collection card and choose which products appear when shoppers explore it.</p></div>
                <div className="homepage-order-actions" aria-label="Collection card order">
                  <button type="button" className="ghost-button" disabled={activeCollectionIndex <= 0} onClick={() => moveCollection(activeCollectionIndex, -1)} aria-label="Move collection up">↑</button>
                  <button type="button" className="ghost-button" disabled={activeCollectionIndex >= draft.collections.length - 1} onClick={() => moveCollection(activeCollectionIndex, 1)} aria-label="Move collection down">↓</button>
                </div>
              </header>
              <div className="homepage-section-editor__body homepage-fields">
                <TextField label="Collection title" value={activeCollection.title} onChange={(value) => updateCollection(activeCollectionIndex, { title: value })} />
                <TextField label="Collection destination (fixed)" value={`#/collections/${activeCollection.slug}`} onChange={() => {}} readOnly />
                <ImageField value={activeCollection.image} onChange={(value) => updateCollection(activeCollectionIndex, { image: value })} onUpload={upload} />
                <TextField label="Collection story" value={activeCollection.story} onChange={(value) => updateCollection(activeCollectionIndex, { story: value })} multiline />
                <div className="homepage-product-picker collection-product-picker">
                  <div className="collection-product-picker__heading">
                    <div>
                      <h4>Products in this collection</h4>
                      <p>Choose the products shoppers see after selecting &quot;Explore collection&quot;.</p>
                    </div>
                    <span className="collection-product-picker__selected">{activeCollection.productSlugs.length} selected</span>
                  </div>
                  <TextField label="Search products" value={productSearch} onChange={setProductSearch} placeholder="Search by product name" />
                  <div className="collection-product-picker__categories" role="group" aria-label="Filter products by category">
                    <button type="button" className={productCategory === 'All' ? 'is-active' : ''} aria-pressed={productCategory === 'All'} onClick={() => setProductCategory('All')}>
                      All products <span>{products.length}</span>
                    </button>
                    {productCategories.map((category) => {
                      const count = products.filter((product) => product.category === category).length;
                      return (
                        <button key={category} type="button" className={productCategory === category ? 'is-active' : ''} aria-pressed={productCategory === category} onClick={() => setProductCategory(category)}>
                          {category} <span>{count}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="collection-product-picker__list" aria-live="polite">
                    {filteredProducts.map((product) => (
                      <label key={product.slug} className={`homepage-product-option ${activeCollection.productSlugs.includes(product.slug) ? 'is-selected' : ''}`}>
                        <input
                          type="checkbox"
                          checked={activeCollection.productSlugs.includes(product.slug)}
                          onChange={(event) => toggleProduct(product.slug, event.target.checked)}
                        />
                        {product.image && <img src={resolveUploadedMediaUrl(product.image)} alt="" loading="lazy" />}
                        <span className="collection-product-picker__product-info">
                          <strong>{product.name}</strong>
                          <small>{product.subcategory} · ${Number(product.price || 0).toFixed(2)}</small>
                        </span>
                        {activeCollection.productSlugs.includes(product.slug) && <span className="collection-product-picker__check" aria-hidden="true">✓</span>}
                      </label>
                    ))}
                    {filteredProducts.length === 0 && <p className="collection-product-picker__empty">No products match this category and search.</p>}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </section>
      </div>

      <section className="homepage-preview-panel" aria-labelledby="collection-preview-title">
        <div className="homepage-preview-panel__heading">
          <div><span className="eyebrow">Content check</span><h3 id="collection-preview-title">Page preview</h3></div>
          <div className="homepage-preview-panel__controls" role="group" aria-label="Preview size">
            {previewSizes.map((size) => <button key={size.id} type="button" className={`homepage-preview-panel__size ${previewSize === size.id ? 'is-active' : ''}`} onClick={() => setPreviewSize(size.id)} aria-pressed={previewSize === size.id}>{size.label}</button>)}
          </div>
          <button type="button" className="ghost-button homepage-preview-panel__refresh" onClick={refreshPreview} disabled={Boolean(busy) || uploadsInProgress > 0}>{busy === 'refresh' ? 'Refreshing…' : 'Refresh preview'}</button>
        </div>
        <div className="homepage-preview-panel__meta">
          <p className="homepage-preview-panel__description">{previewSize === 'desktop' ? 'Wide desktop layout' : previewSize === 'tablet' ? 'Tablet-width layout' : 'Mobile-width layout'} · {activePreviewSize.width} × {activePreviewSize.height.replace('px', '')}</p>
          <span className="homepage-preview-panel__visibility is-visible">Published page layout</span>
        </div>
        <div className="homepage-preview-panel__stage">
          <div className={`homepage-preview-panel__viewport homepage-preview-panel__viewport--${previewSize}`} style={{ '--preview-width': activePreviewSize.width }}>
            {previewUrl
              ? <iframe key={previewUrl} className="homepage-preview-panel__iframe" title="Collections page storefront preview" src={previewUrl} style={{ height: activePreviewSize.height }} loading="lazy" />
              : <div className="homepage-preview-panel__empty"><strong>Live preview is not ready</strong><span>Save and refresh to load the collection page using the real storefront.</span></div>}
          </div>
        </div>
        <div className="homepage-preview-panel__foot">
          <strong>This preview uses the actual storefront page and styles.</strong>
          <span>Refreshing saves unsaved changes, then loads the page at {activePreviewSize.width} × {activePreviewSize.height.replace('px', '')}.</span>
        </div>
      </section>
    </div>
  );
}
