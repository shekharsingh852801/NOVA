import { useEffect, useMemo, useRef, useState } from 'react';
import { adminApi, resolveUploadedMediaUrl } from '../services/adminApi.js';

const sectionNames = {
  hero: 'Hero banner',
  featureBar: 'Feature bar',
  newArrivals: 'New arrivals',
  categories: 'Category grid',
  brandStory: 'Brand story',
  sustainability: 'Sustainability',
  testimonials: 'Testimonials',
  lookbook: 'Lookbook',
  newsletter: 'Newsletter',
  footer: 'Footer',
};

const sectionDescriptions = {
  hero: 'Lead with the campaign image and message.',
  featureBar: 'Highlight the reasons customers choose NOVA.',
  newArrivals: 'Choose the products featured on the home page.',
  categories: 'Set the category tiles shoppers can explore.',
  brandStory: 'Tell the story behind the NOVA brand.',
  sustainability: 'Share your materials and commitments.',
  testimonials: 'Curate customer quotes and ratings.',
  lookbook: 'Arrange editorial imagery and inspiration.',
  newsletter: 'Invite visitors to join the NOVA community.',
  footer: 'Update social profiles, contact details, and footer navigation.',
};

const previewSizes = [
  { id: 'desktop', label: 'Desktop', width: '1280px', height: '800px' },
  { id: 'tablet', label: 'Tablet', width: '768px', height: '1024px' },
  { id: 'mobile', label: 'Mobile', width: '390px', height: '844px' },
];

const storefrontUrl = import.meta.env.VITE_STOREFRONT_URL || `${window.location.protocol}//${window.location.hostname}:5173`;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function TextField({ label, value, onChange, multiline = false, type = 'text', placeholder = '', options }) {
  return (
    <label className="homepage-field">
      <span>{label}</span>
      {options ? (
        <select value={value ?? options[0]} onChange={(event) => onChange(event.target.value)}>
          {options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      ) : multiline ? (
        <textarea value={value ?? ''} placeholder={placeholder} rows={3} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input type={type} value={value ?? ''} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
  );
}

function ImageField({ label, value, onChange, onUpload, busy }) {
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const maxImageSize = 5 * 1024 * 1024;

  async function upload(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setError('');
    if (file.size > maxImageSize) {
      setError('Image must be 5 MB or smaller.');
      return;
    }
    setUploading(true);
    try {
      const url = await onUpload(file);
      onChange(url);
    } catch (uploadError) {
      setError(uploadError.message || 'Image upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="homepage-image-field">
      <TextField label={label} value={value} onChange={onChange} placeholder="/uploads/image.webp or https://..." />
      <label className="homepage-upload-button">
        {busy || uploading ? 'Uploading…' : 'Upload image (max 5 MB)'}
        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={upload} disabled={busy || uploading} />
      </label>
      {value && (
        <img
          className="homepage-image-preview"
          src={resolveUploadedMediaUrl(value)}
          alt=""
          onLoad={() => setError('')}
          onError={() => setError('Image could not be displayed. Check that the image URL is reachable.')}
        />
      )}
      {error && <p className="homepage-error">{error}</p>}
    </div>
  );
}

function ListEditor({ title, label, items, fields, onChange, onUpload }) {
  const maximums = {
    messages: 5,
    items: fields.some((field) => field.key === 'quote') ? 10 : 8,
    stats: 8,
    points: 8,
    testimonials: 10,
    images: 12,
    links: 24,
    legalLinks: 6,
  };
  return (
    <div className="homepage-list-editor">
      <div className="homepage-list-heading">
        <h4>{label}</h4>
        <button
          type="button"
          className="ghost-button"
          disabled={items.length >= (maximums[title] || 10)}
          onClick={() => onChange([...items, Object.fromEntries(fields.map((field) => [
            field.key,
            field.type === 'checkbox' ? false : field.type === 'number' || field.key === 'rating' ? 5 : field.options?.[0] || (field.key === 'cta' ? 'Shop Now' : ''),
          ]))])}
        >
          Add item
        </button>
      </div>
      {items.map((item, index) => {
        const summary = item.name || item.title || item.label || item.alt || item.quote || item.value || `Item ${index + 1}`;
        const image = item.image || item.src || item.avatar;
        return (
          <details className="homepage-list-item" key={`${title}-${index}`}>
            <summary className="homepage-list-item__summary">
              {image
                ? <img className="homepage-list-item__thumbnail" src={image} alt="" />
                : <span className="homepage-list-item__number">{String(index + 1).padStart(2, '0')}</span>}
              <span className="homepage-list-item__name">{summary}</span>
              <span className="homepage-list-item__hint">Edit</span>
            </summary>
            <div className="homepage-list-item__body">
              <div className="homepage-list-item__fields">
                {fields.map((field) => {
                  if (field.type === 'image') {
                    return (
                      <ImageField
                        key={field.key}
                        label={field.label}
                        value={item[field.key]}
                        onChange={(value) => onChange(items.map((row, rowIndex) => rowIndex === index ? { ...row, [field.key]: value } : row))}
                        onUpload={onUpload}
                        busy={false}
                      />
                    );
                  }
                  if (field.type === 'checkbox') {
                    return (
                      <label className="homepage-checkbox" key={field.key}>
                        <input
                          type="checkbox"
                          checked={Boolean(item[field.key])}
                          onChange={(event) => onChange(items.map((row, rowIndex) => rowIndex === index ? { ...row, [field.key]: event.target.checked } : row))}
                        />
                        {field.label}
                      </label>
                    );
                  }
                  return (
                    <TextField
                      key={field.key}
                      label={field.label}
                      value={item[field.key]}
                      type={field.type === 'number' ? 'number' : 'text'}
                      multiline={field.type === 'textarea'}
                      options={field.options}
                      onChange={(value) => onChange(items.map((row, rowIndex) => rowIndex === index ? { ...row, [field.key]: field.type === 'number' ? Number(value) : value } : row))}
                    />
                  );
                })}
              </div>
              <button
                type="button"
                className="ghost-button homepage-remove-button"
                onClick={() => onChange(items.filter((_, rowIndex) => rowIndex !== index))}
                aria-label={`Remove ${title} item ${index + 1}`}
              >
                Remove item
              </button>
            </div>
          </details>
        );
      })}
    </div>
  );
}

function SectionFields({ section, update, upload }) {
  const field = (key, label, options = {}) => (
    <TextField key={key} label={label} value={section[key]} onChange={(value) => update({ [key]: value })} {...options} />
  );
  const image = (key, label) => (
    <ImageField
      key={key}
      label={label}
      value={section[key]}
      onChange={(value) => update({ [key]: value })}
      onUpload={upload}
    />
  );
  const list = (key, title, fields) => (
    <ListEditor
      key={key}
      title={key}
      label={title}
      items={section[key]}
      fields={fields}
      onChange={(items) => update({ [key]: items })}
      onUpload={upload}
    />
  );

  switch (section.id) {
    case 'hero':
      return <div className="homepage-fields">
        {image('image', 'Banner image')}
        {field('alt', 'Image description')}
        {field('eyebrow', 'Eyebrow')}
        {field('heading', 'Heading', { multiline: true })}
        {field('description', 'Description', { multiline: true })}
        {field('primaryLabel', 'Primary button label')}
        {field('primaryHref', 'Primary button link', { placeholder: '#new-arrivals or #/shop' })}
        {field('secondaryLabel', 'Video button label')}
      </div>;
    case 'featureBar':
      return list('items', 'Feature items', [
        { key: 'title', label: 'Title' }, { key: 'subtitle', label: 'Subtitle' },
      ]);
    case 'newArrivals':
      return <div className="homepage-fields">
        {field('eyebrow', 'Eyebrow')}
        {field('heading', 'Heading')}
        {field('buttonLabel', 'Button label')}
        {field('buttonHref', 'Button link')}
        <div className="homepage-product-picker">
          <h4>Products shown</h4>
          <p>Select products from the existing catalog. Choose up to 10.</p>
          {section.availableProducts.map((product) => (
            <label key={product.slug} className="homepage-product-option">
              <input
                type="checkbox"
                checked={section.productSlugs.includes(product.slug)}
                disabled={!section.productSlugs.includes(product.slug) && section.productSlugs.length >= 10}
                onChange={(event) => {
                  const next = event.target.checked
                    ? [...section.productSlugs, product.slug]
                    : section.productSlugs.filter((slug) => slug !== product.slug);
                  update({ productSlugs: next });
                }}
              />
              {product.name}
            </label>
          ))}
          {section.availableProducts.length === 0 && <p>No products are available in the catalog.</p>}
        </div>
      </div>;
    case 'categories':
      return <div className="homepage-fields">
        {field('eyebrow', 'Eyebrow')}
        {field('heading', 'Heading')}
        {field('description', 'Description', { multiline: true })}
        {field('buttonLabel', 'Button label')}
        {field('buttonHref', 'Explore all link')}
        {list('items', 'Category cards', [
          { key: 'name', label: 'Category', options: ['Men', 'Women', 'Accessories', 'Sale'] },
          { key: 'cta', label: 'Card button label' },
          { key: 'image', label: 'Card image', type: 'image' },
        ])}
      </div>;
    case 'brandStory':
      return <div className="homepage-fields">
        {image('image', 'Story image')}
        {field('alt', 'Image description')}
        {field('eyebrow', 'Eyebrow')}
        {field('heading', 'Heading')}
        {field('description', 'Description', { multiline: true })}
        {field('buttonLabel', 'Button label')}
        {field('buttonHref', 'Button link', { placeholder: '#/about' })}
        {list('stats', 'Brand statistics', [
          { key: 'value', label: 'Value' }, { key: 'label', label: 'Label' },
        ])}
      </div>;
    case 'sustainability':
      return <div className="homepage-fields">
        {image('image', 'Background image')}
        {field('alt', 'Image description')}
        {field('eyebrow', 'Eyebrow')}
        {field('heading', 'Heading')}
        {field('description', 'Description', { multiline: true })}
        {field('buttonLabel', 'Button label')}
        {field('buttonHref', 'Button link', { placeholder: '#/about' })}
        {list('points', 'Commitments', [
          { key: 'title', label: 'Title' }, { key: 'subtitle', label: 'Subtitle' },
        ])}
      </div>;
    case 'testimonials':
      return <div className="homepage-fields">
        {field('eyebrow', 'Eyebrow')}
        {field('heading', 'Heading')}
        {list('items', 'Testimonials', [
          { key: 'name', label: 'Customer name' },
          { key: 'avatar', label: 'Avatar image', type: 'image' },
          { key: 'rating', label: 'Rating (1–5)', type: 'number' },
          { key: 'verified', label: 'Verified buyer', type: 'checkbox' },
          { key: 'quote', label: 'Quote', type: 'textarea' },
          { key: 'postedAt', label: 'Date label' },
        ])}
      </div>;
    case 'lookbook':
      return <div className="homepage-fields">
        {field('eyebrow', 'Eyebrow')}
        {field('heading', 'Heading')}
        {field('description', 'Description', { multiline: true })}
        {field('buttonLabel', 'Button label')}
        {list('images', 'Lookbook images', [
          { key: 'src', label: 'Image', type: 'image' }, { key: 'alt', label: 'Image description' },
        ])}
      </div>;
    case 'newsletter':
      return <div className="homepage-fields">
        {image('image', 'Background image')}
        {field('alt', 'Image description')}
        {field('eyebrow', 'Eyebrow')}
        {field('heading', 'Heading')}
        {field('description', 'Description', { multiline: true })}
      </div>;
    case 'footer':
      return <div className="homepage-fields">
        {field('tagline', 'Brand tagline')}
        {field('instagramHandle', 'Instagram ID', { placeholder: '@yourbrand' })}
        {field('instagramUrl', 'Instagram profile URL', { type: 'url', placeholder: 'https://instagram.com/yourbrand' })}
        {field('facebookUrl', 'Facebook profile URL', { type: 'url', placeholder: 'https://facebook.com/yourbrand' })}
        {field('pinterestUrl', 'Pinterest profile URL', { type: 'url', placeholder: 'https://pinterest.com/yourbrand' })}
        {field('youtubeUrl', 'YouTube channel URL', { type: 'url', placeholder: 'https://youtube.com/@yourbrand' })}
        {field('tiktokUrl', 'TikTok profile URL', { type: 'url', placeholder: 'https://tiktok.com/@yourbrand' })}
        {field('contactEmail', 'Contact email', { type: 'email', placeholder: 'hello@example.com' })}
        {field('supportPhone', 'Support phone', { type: 'tel', placeholder: '+1 555 010 1234' })}
        {field('newsletterHeading', 'Newsletter heading')}
        {field('newsletterDescription', 'Newsletter description', { multiline: true })}
        {field('copyright', 'Copyright text')}
        {list('legalLinks', 'Legal links', [
          { key: 'label', label: 'Link label' },
          { key: 'href', label: 'Link destination' },
        ])}
      </div>;
    default:
      return null;
  }
}

export default function Homepage() {
  const [draft, setDraft] = useState(null);
  const [saved, setSaved] = useState(null);
  const [activeSectionId, setActiveSectionId] = useState('hero');
  const [previewSize, setPreviewSize] = useState('desktop');
  const [sectionPreviewHeight, setSectionPreviewHeight] = useState(0);
  const sectionPreviewFrame = useRef(null);
  const [products, setProducts] = useState([]);
  const [publishedAt, setPublishedAt] = useState(null);
  const [hasPersistedDraft, setHasPersistedDraft] = useState(false);
  const [sectionPreviewToken, setSectionPreviewToken] = useState('');
  const [sectionPreviewError, setSectionPreviewError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [uploadsInProgress, setUploadsInProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [homepage, catalog] = await Promise.all([adminApi.getHomepage(), adminApi.getProducts()]);
        if (!active) return;
        const availableProducts = catalog;
        const content = clone(homepage.draft);
        const newArrivals = content.sections.find((section) => section.id === 'newArrivals');
        if (newArrivals.productSlugs.length === 0) {
          newArrivals.productSlugs = catalog
            .filter((product) => product.newArrival || product.featured)
            .slice(0, 5)
            .map((product) => product.slug);
        }
        setProducts(availableProducts);
        setDraft(content);
        setSaved(clone(content));
        setPublishedAt(homepage.publishedAt);
        setHasPersistedDraft(homepage.hasDraft);
        if (homepage.hasDraft) {
          try {
            const { token } = await adminApi.createHomepagePreview();
            if (active) setSectionPreviewToken(token);
          } catch (previewError) {
            if (active) setSectionPreviewError(previewError.message || 'Could not prepare the live section preview.');
          }
        }
      } catch (loadError) {
        setError(loadError.message || 'Could not load homepage content');
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
  const activeSectionIndex = activeSectionId === 'footer'
    ? draft?.sections.length ?? 0
    : draft?.sections.findIndex((section) => section.id === activeSectionId) ?? -1;
  const activeSection = activeSectionId === 'footer'
    ? draft ? { id: 'footer', ...draft.footer } : null
    : activeSectionIndex >= 0 ? draft.sections[activeSectionIndex] : draft?.sections[0];
  const visibleSectionCount = draft?.sections.filter((section) => section.enabled).length || 0;
  const activeSectionVisible = activeSection?.id === 'footer' || Boolean(activeSection?.enabled);
  const activePreviewSize = previewSizes.find((size) => size.id === previewSize) || previewSizes[0];
  const sectionPreviewUrl = useMemo(() => {
    if (!sectionPreviewToken || !activeSection) return '';
    const target = new URL(storefrontUrl);
    target.searchParams.set('homepagePreview', sectionPreviewToken);
    target.searchParams.set('section', activeSection.id);
    target.hash = '/';
    return target.toString();
  }, [sectionPreviewToken, activeSection?.id]);

  useEffect(() => {
    setSectionPreviewHeight(0);
    if (!sectionPreviewUrl) return undefined;

    const expectedOrigin = new URL(storefrontUrl).origin;
    const handlePreviewSize = (event) => {
      if (
        event.origin !== expectedOrigin
        || event.source !== sectionPreviewFrame.current?.contentWindow
        || event.data?.type !== 'nova-homepage-section-preview-size'
        || !Number.isFinite(event.data.height)
      ) return;
      setSectionPreviewHeight(Math.max(40, Math.min(12000, Math.ceil(event.data.height))));
    };

    window.addEventListener('message', handlePreviewSize);
    return () => window.removeEventListener('message', handlePreviewSize);
  }, [sectionPreviewUrl]);

  useEffect(() => {
    if (!hasChanges) return undefined;
    const warnBeforeLeaving = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warnBeforeLeaving);
    return () => window.removeEventListener('beforeunload', warnBeforeLeaving);
  }, [hasChanges]);

  function updateSection(id, patch) {
    if (id === 'footer') {
      setDraft((current) => ({ ...current, footer: { ...current.footer, ...patch } }));
      return;
    }
    setDraft((current) => ({
      ...current,
      sections: current.sections.map((section) => section.id === id ? { ...section, ...patch } : section),
    }));
  }

  async function upload(file) {
    setUploadsInProgress((count) => count + 1);
    try {
      const result = await adminApi.uploadHomepageMedia(file);
      return result.url;
    } finally {
      setUploadsInProgress((count) => count - 1);
    }
  }

  async function saveDraft() {
    const draftToSave = clone(draft);
    setBusy('save');
    setError('');
    setMessage('');
    try {
      const result = await adminApi.saveHomepageDraft(draftToSave);
      setSaved(clone(result.draft));
      setDraft((current) => JSON.stringify(current) === JSON.stringify(draftToSave) ? clone(result.draft) : current);
      setHasPersistedDraft(true);
      setMessage('Draft saved. It is not live until published.');
    } catch (saveError) {
      setError(saveError.message || 'Could not save the homepage draft');
    } finally {
      setBusy('');
    }
  }

  async function publish() {
    const draftToPublish = clone(draft);
    setBusy('publish');
    setError('');
    setMessage('');
    try {
      const savedDraft = await adminApi.saveHomepageDraft(draftToPublish);
      setDraft((current) => JSON.stringify(current) === JSON.stringify(draftToPublish) ? clone(savedDraft.draft) : current);
      setSaved(clone(savedDraft.draft));
      setHasPersistedDraft(true);
      const result = await adminApi.publishHomepage();
      setPublishedAt(result.publishedAt);
      setMessage('Homepage published successfully.');
    } catch (publishError) {
      setError(publishError.message || 'Could not publish the homepage');
    } finally {
      setBusy('');
    }
  }

  async function preview() {
    setError('');
    setMessage('');
    const previewWindow = window.open('', '_blank');
    if (!previewWindow) {
      setError('Allow pop-ups to open the storefront preview.');
      return;
    }
    previewWindow.opener = null;
    const draftToPreview = clone(draft);
    setBusy('preview');
    try {
      if (hasChanges || !hasPersistedDraft) {
        const result = await adminApi.saveHomepageDraft(draftToPreview);
        setDraft((current) => JSON.stringify(current) === JSON.stringify(draftToPreview) ? clone(result.draft) : current);
        setSaved(clone(result.draft));
        setHasPersistedDraft(true);
      }
      const { token } = await adminApi.createHomepagePreview();
      const target = new URL(storefrontUrl);
      target.searchParams.set('homepagePreview', token);
      target.hash = '/';
      previewWindow.location.replace(target.toString());
    } catch (previewError) {
      previewWindow.close();
      setError(previewError.message || 'Could not open the storefront preview');
    } finally {
      setBusy('');
    }
  }

  async function refreshSectionPreview() {
    setBusy('section-preview');
    setSectionPreviewError('');
    try {
      if (hasChanges || !hasPersistedDraft) {
        const result = await adminApi.saveHomepageDraft(clone(draft));
        setSaved(clone(result.draft));
        setDraft((current) => JSON.stringify(current) === JSON.stringify(draft) ? clone(result.draft) : current);
        setHasPersistedDraft(true);
      }
      const { token } = await adminApi.createHomepagePreview();
      setSectionPreviewToken(token);
    } catch (previewError) {
      setSectionPreviewError(previewError.message || 'Could not refresh the live section preview.');
    } finally {
      setBusy('');
    }
  }

  function moveSection(index, direction) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= draft.sections.length) return;
    const sections = [...draft.sections];
    [sections[index], sections[targetIndex]] = [sections[targetIndex], sections[index]];
    setDraft((current) => ({ ...current, sections }));
  }

  function discardChanges() {
    if (!saved || !window.confirm('Discard all unsaved homepage changes?')) return;
    setDraft(clone(saved));
    setMessage('Unsaved changes discarded.');
    setError('');
  }

  function toggleSection(section) {
    updateSection(section.id, { enabled: !section.enabled });
  }

  if (loading) return <div className="loading-shell">Loading homepage content…</div>;
  if (!draft) return <div className="admin-card"><p className="homepage-error">{error}</p></div>;

  return (
    <div className="homepage-editor">
      <header className="homepage-editor__header">
        <div className="homepage-editor__heading">
          <div className="homepage-editor__title">
            <div>
              <p className="eyebrow">Storefront / Content</p>
              <h2>Homepage</h2>
              <p>Build and publish the content shoppers see on your landing page.</p>
            </div>
            <span className={`homepage-save-indicator ${hasChanges ? 'is-dirty' : ''}`}>
              <span aria-hidden="true" />
              {hasChanges ? 'Unsaved changes' : hasPersistedDraft ? 'Draft saved' : 'Not saved yet'}
            </span>
          </div>
          <div className="homepage-editor__stats">
            <span><strong>{draft.sections.length + 1}</strong> page areas</span>
            <span><strong>{visibleSectionCount + 1}</strong> visible</span>
            <span>{publishedAt ? `Live since ${new Date(publishedAt).toLocaleDateString()}` : 'Not published'}</span>
          </div>
        </div>
        <div className="homepage-editor__actions">
          {hasChanges && <button type="button" className="ghost-button homepage-action-discard" onClick={discardChanges} disabled={Boolean(busy) || uploadsInProgress > 0}>
            Discard
          </button>}
          <button type="button" className="ghost-button homepage-action-preview" onClick={preview} disabled={Boolean(busy) || uploadsInProgress > 0}>
            {busy === 'preview' ? 'Preparing preview...' : 'Preview'}
          </button>
          <button type="button" className="ghost-button homepage-action-save" onClick={saveDraft} disabled={Boolean(busy) || uploadsInProgress > 0 || (!hasChanges && hasPersistedDraft)}>
            {busy === 'save' ? 'Saving…' : 'Save draft'}
          </button>
          <button type="button" className="primary-button homepage-action-publish" onClick={publish} disabled={Boolean(busy) || uploadsInProgress > 0}>
            {busy === 'publish' ? 'Publishing…' : 'Publish'}
          </button>
        </div>
      </header>
      {uploadsInProgress > 0 && <p className="homepage-editor__upload-status" role="status">Image upload in progress. Save and publish are paused until it finishes.</p>}
      {error && <p className="homepage-error" role="alert">{error}</p>}
      {message && <p className="homepage-success" role="status">{message}</p>}

      <div className="homepage-workspace">
        <aside className="homepage-section-nav" aria-label="Homepage sections">
          <div className="homepage-section-nav__heading">
            <div><span className="eyebrow">Page structure</span><h3>Sections</h3></div>
            <span>{draft.sections.length + 1}</span>
          </div>
          <ol>
            {draft.sections.map((section, index) => (
              <li key={section.id}>
                <button
                  type="button"
                  className={`homepage-section-nav__item ${activeSection?.id === section.id ? 'is-active' : ''} ${!section.enabled ? 'is-hidden' : ''}`}
                  onClick={() => setActiveSectionId(section.id)}
                  aria-current={activeSection?.id === section.id ? 'step' : undefined}
                >
                  <span className="homepage-section-nav__number">{String(index + 1).padStart(2, '0')}</span>
                  <span className="homepage-section-nav__label">
                    <strong>{sectionNames[section.id]}</strong>
                    <small>{section.enabled ? 'Visible' : 'Hidden'}</small>
                  </span>
                  <span className="homepage-section-nav__status" aria-label={section.enabled ? 'Visible' : 'Hidden'} />
                </button>
              </li>
            ))}
            <li key="footer">
              <button
                type="button"
                className={`homepage-section-nav__item ${activeSection?.id === 'footer' ? 'is-active' : ''}`}
                onClick={() => setActiveSectionId('footer')}
                aria-current={activeSection?.id === 'footer' ? 'step' : undefined}
              >
                <span className="homepage-section-nav__number">{String(draft.sections.length + 1).padStart(2, '0')}</span>
                <span className="homepage-section-nav__label">
                  <strong>{sectionNames.footer}</strong>
                  <small>Site-wide</small>
                </span>
                <span className="homepage-section-nav__status" aria-label="Shown site-wide" />
              </button>
            </li>
          </ol>
          <p className="homepage-section-nav__note">The footer appears across the storefront. Edit its details here; homepage sections can still be reordered independently.</p>
        </aside>

        <section className="homepage-section-editor" aria-labelledby="homepage-section-title">
          {activeSection && <>
            <header className="homepage-section-editor__header">
              <div>
                <span className="homepage-section-editor__position">{activeSection.id === 'footer' ? 'SITE-WIDE FOOTER' : `SECTION ${String(activeSectionIndex + 1).padStart(2, '0')} OF ${String(draft.sections.length).padStart(2, '0')}`}</span>
                <h3 id="homepage-section-title">{sectionNames[activeSection.id]}</h3>
                <p>{sectionDescriptions[activeSection.id]}</p>
              </div>
              {activeSection.id !== 'footer' && <div className="homepage-section-editor__actions">
                <label className="homepage-visibility">
                  <input type="checkbox" checked={activeSection.enabled} onChange={() => toggleSection(activeSection)} />
                  <span>{activeSection.enabled ? 'Visible' : 'Hidden'}</span>
                </label>
                <div className="homepage-order-actions" aria-label="Section order">
                  <button type="button" className="ghost-button" disabled={activeSectionIndex <= 0} onClick={() => moveSection(activeSectionIndex, -1)} aria-label="Move section up">↑</button>
                  <button type="button" className="ghost-button" disabled={activeSectionIndex >= draft.sections.length - 1} onClick={() => moveSection(activeSectionIndex, 1)} aria-label="Move section down">↓</button>
                </div>
              </div>}
            </header>
            <div className="homepage-section-editor__body">
              <SectionFields
                section={activeSection.id === 'newArrivals' ? { ...activeSection, availableProducts: products } : activeSection}
                update={(patch) => updateSection(activeSection.id, patch)}
                upload={upload}
              />
            </div>
          </>}
        </section>

      </div>

      <section className="homepage-preview-panel" aria-labelledby="homepage-preview-title">
        <div className="homepage-preview-panel__heading">
          <div>
            <span className="eyebrow">Content check</span>
            <h3 id="homepage-preview-title">Section preview</h3>
          </div>
          <div className="homepage-preview-panel__controls" role="group" aria-label="Preview size">
            {previewSizes.map((size) => (
              <button
                key={size.id}
                type="button"
                className={`homepage-preview-panel__size ${previewSize === size.id ? 'is-active' : ''}`}
                onClick={() => setPreviewSize(size.id)}
                aria-pressed={previewSize === size.id}
              >
                {size.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="ghost-button homepage-preview-panel__refresh"
            onClick={refreshSectionPreview}
            disabled={Boolean(busy) || uploadsInProgress > 0}
          >
            {busy === 'section-preview' ? 'Refreshing…' : 'Refresh preview'}
          </button>
        </div>
        <div className="homepage-preview-panel__meta">
          <p className="homepage-preview-panel__description">
            {previewSize === 'desktop' ? 'Wide desktop layout' : previewSize === 'tablet' ? 'Tablet-width layout' : 'Mobile-width layout'}
            {' · '}
            {activePreviewSize.width} × {activePreviewSize.height.replace('px', '')}
            {' · '}
            {activeSectionVisible ? 'Visible on page' : 'Section hidden'}
          </p>
          <span className={`homepage-preview-panel__visibility ${activeSectionVisible ? 'is-visible' : ''}`}>{activeSectionVisible ? 'On page' : 'Hidden'}</span>
        </div>
        <div className="homepage-preview-panel__stage">
          <div className={`homepage-preview-panel__viewport homepage-preview-panel__viewport--${previewSize}`} style={{ '--preview-width': activePreviewSize.width }}>
            {sectionPreviewUrl ? (
              <iframe
                key={sectionPreviewUrl}
                className="homepage-preview-panel__iframe"
                title={`${sectionNames[activeSection.id]} live storefront preview`}
                src={sectionPreviewUrl}
                ref={sectionPreviewFrame}
                onLoad={() => sectionPreviewFrame.current?.contentWindow?.postMessage({ type: 'nova-homepage-section-preview-request-size' }, '*')}
                style={{ height: `${sectionPreviewHeight || Number.parseInt(activePreviewSize.height, 10)}px` }}
                loading="lazy"
              />
            ) : (
              <div className="homepage-preview-panel__empty">
                <strong>Live preview is not ready</strong>
                <span>Save and refresh to load this section using the real storefront.</span>
              </div>
            )}
          </div>
          {sectionPreviewError && <p className="homepage-error" role="alert">{sectionPreviewError}</p>}
        </div>
        <div className="homepage-preview-panel__foot">
          <strong>This preview uses the actual storefront section and styles.</strong>
          <span>Refreshing saves unsaved changes, then loads the selected section at {activePreviewSize.width} × {activePreviewSize.height.replace('px', '')}.</span>
        </div>
      </section>
    </div>
  );
}
