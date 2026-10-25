import { useEffect, useMemo, useState } from "react";
import {
  ArrowIcon,
  BellIcon,
  BoxIcon,
  CheckIcon,
  ChevronIcon,
  CloseIcon,
  HomeIcon,
  MenuIcon,
  PackageIcon,
  PlusIcon,
  SearchIcon,
  ShieldIcon,
  TruckIcon,
  UserIcon,
} from "./Icons.jsx";
import {
  adminNavGroups,
  adminDashboardMetrics,
  adminOrderStatus,
  adminProducts,
  adminCustomers,
  adminNotifications,
  adminSalesSeries,
  categoryPerformance,
  inventoryItems,
  lowStockProducts,
  recentOrders,
  topProducts,
} from "../services/adminData.js";
import {
  adminLogin,
  createAdminCoupon,
  deleteAdminCoupon,
  fetchAdminCoupons,
  fetchAdminCsv,
  fetchPublicSettings,
  saveAdminSettings,
  updateAdminCoupon,
} from "../api/api.js";

const adminTitleMap = {
  dashboard: "Dashboard",
  orders: "Orders",
  products: "Products",
  inventory: "Inventory",
  customers: "Customers",
  discounts: "Discounts",
  categories: "Categories",
  collections: "Collections",
  "size-guides": "Size Guides",
  "shop-the-look": "Shop the Look",
  homepage: "Homepage",
  lookbook: "Lookbook",
  journal: "Journal",
  reviews: "Reviews",
  analytics: "Sales Analytics",
  shipping: "Shipping",
  payments: "Payments",
  settings: "Store Settings",
  admin: "Admin & Permissions",
  notifications: "Notifications",
  returns: "Returns & Refunds",
};

const statusTone = {
  Active: "success",
  Pending: "neutral",
  Shipped: "info",
  Confirmed: "info",
  Processing: "warn",
  Delivered: "success",
  Cancelled: "danger",
  Returned: "danger",
  Draft: "neutral",
  "Low Stock": "warn",
  "Out of Stock": "danger",
  Available: "success",
};

function metricsTrendIcon(trend) {
  return trend === "up" ? "+" : "−";
}

function AdminSkeleton() {
  return (
    <div className="admin-page admin-page--loading" aria-busy="true">
      <div className="admin-kpis-grid">
        {Array.from({ length: 5 }).map((_, index) => (
          <div className="admin-card admin-card--skeleton" key={index} />
        ))}
      </div>
      <div className="admin-grid-two">
        <div className="admin-card admin-card--skeleton large" />
        <div className="admin-card admin-card--skeleton large" />
      </div>
      <div className="admin-grid-three">
        <div className="admin-card admin-card--skeleton" />
        <div className="admin-card admin-card--skeleton" />
        <div className="admin-card admin-card--skeleton" />
      </div>
    </div>
  );
}

function AdminEmptyState({ title, description, actionLabel = "Create item" }) {
  return (
    <div className="admin-empty-state">
      <div className="admin-empty-state__icon">∅</div>
      <h3>{title}</h3>
      <p>{description}</p>
      <button type="button" className="btn btn--light">{actionLabel}</button>
    </div>
  );
}

function DashboardView({ onAction }) {
  return (
    <>
      <div className="admin-page__header">
        <div>
          <p className="eyebrow eyebrow--light">Overview</p>
          <h1>Good morning, Admin</h1>
        </div>
        <button type="button" className="btn btn--ghost-light" onClick={() => onAction("Dashboard refreshed")}>Refresh</button>
      </div>

      <div className="admin-kpis-grid">
        {adminDashboardMetrics.map((metric) => (
          <div className="admin-card admin-metric" key={metric.label}>
            <div className="admin-metric__top">
              <span className="admin-meta-label">{metric.label}</span>
              <span className="admin-trend admin-trend--up">{metric.change}</span>
            </div>
            <div className="admin-metric__value">{metric.value}</div>
            <div className="admin-metric__meta">
              <span className="admin-trend admin-trend--up">{metricsTrendIcon(metric.trend)} {metric.comparison}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-grid-two">
        <div className="admin-card admin-card--panel">
          <div className="admin-card__head">
            <div>
              <p className="eyebrow eyebrow--light">Sales Overview</p>
              <h2>Revenue trend</h2>
            </div>
            <div className="segmented-control">
              {['7 Days', '30 Days', '3 Months', '1 Year'].map((range) => (
                <button type="button" className={range === '7 Days' ? 'active' : ''} key={range}>{range}</button>
              ))}
            </div>
          </div>
          <div className="admin-chart" aria-label="Sales overview chart">
            <svg viewBox="0 0 520 220" role="img" preserveAspectRatio="none">
              <defs>
                <linearGradient id="revenueFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="rgba(115,184,255,0.35)" />
                  <stop offset="100%" stopColor="rgba(115,184,255,0.02)" />
                </linearGradient>
              </defs>
              {Array.from({ length: 5 }).map((_, index) => (
                <line key={index} x1="0" x2="520" y1={30 + index * 40} y2={30 + index * 40} stroke="rgba(255,255,255,0.08)" strokeDasharray="4 8" />
              ))}
              <path d="M0 160 C60 120, 80 90, 120 100 S190 190, 240 140 S320 60, 370 70 S450 112, 520 45 L520 220 L0 220 Z" fill="url(#revenueFill)" />
              <path d="M0 160 C60 120, 80 90, 120 100 S190 190, 240 140 S320 60, 370 70 S450 112, 520 45" fill="none" stroke="#8cc8ff" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <div className="admin-card admin-card--panel">
          <div className="admin-card__head">
            <div>
              <p className="eyebrow eyebrow--light">Order Status</p>
              <h2>Fulfilment mix</h2>
            </div>
          </div>
          <div className="admin-status-breakdown">
            <div className="admin-status-breakdown__ring" aria-label="Order status chart">
              <svg viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
                {adminOrderStatus.map((item, index) => {
                  const start = 0;
                  const circumference = 2 * Math.PI * 40;
                  const ratio = item.value / 100;
                  const dash = `${ratio * circumference} ${circumference}`;
                  const offset = start - index * 6;
                  return (
                    <circle
                      key={item.label}
                      cx="60"
                      cy="60"
                      r="40"
                      fill="none"
                      stroke={item.color}
                      strokeWidth="12"
                      strokeDasharray={dash}
                      strokeLinecap="round"
                      transform="rotate(-90 60 60)"
                      style={{ strokeDashoffset: offset }}
                    />
                  );
                })}
              </svg>
              <div className="admin-status-breakdown__center">
                <strong>248</strong>
                <span>Total Orders</span>
              </div>
            </div>
            <ul className="admin-status-list">
              {adminOrderStatus.map((item) => (
                <li key={item.label}>
                  <span className="admin-status-dot" style={{ background: item.color }} />
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="admin-grid-three">
        <div className="admin-card admin-card--panel">
          <div className="admin-card__head">
            <div>
              <p className="eyebrow eyebrow--light">Top Selling Products</p>
              <h2>Best sellers</h2>
            </div>
            <button type="button" className="text-link text-link--light" onClick={() => onAction("Opened product report")}>View All</button>
          </div>
          <div className="admin-list-compact">
            {topProducts.map((product) => (
              <div className="admin-list-row" key={product.name}>
                <div className="admin-product-identity">
                  <img src={product.image} alt={product.name} />
                  <div>
                    <strong>{product.name}</strong>
                    <span>{product.sold} sold</span>
                  </div>
                </div>
                <div className="admin-list-row__meta">
                  <strong>{product.revenue}</strong>
                  <span>{product.trend}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card admin-card--panel">
          <div className="admin-card__head">
            <div>
              <p className="eyebrow eyebrow--light">Best Performing Categories</p>
              <h2>Revenue mix</h2>
            </div>
            <button type="button" className="text-link text-link--light" onClick={() => onAction("Opened category report")}>View All</button>
          </div>
          <div className="admin-list-compact">
            {categoryPerformance.map((category) => (
              <div className="admin-list-row" key={category.name}>
                <div>
                  <strong>{category.name}</strong>
                  <span>{category.orders} orders</span>
                </div>
                <div className="admin-list-row__meta">
                  <strong>{category.revenue}</strong>
                  <span className="admin-trend admin-trend--up">{category.change}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card admin-card--panel">
          <div className="admin-card__head">
            <div>
              <p className="eyebrow eyebrow--light">Low Stock Products</p>
              <h2>Reorder queue</h2>
            </div>
            <button type="button" className="text-link text-link--light" onClick={() => onAction("Opened inventory")}>View All</button>
          </div>
          <div className="admin-list-compact">
            {lowStockProducts.map((item) => (
              <div className="admin-list-row" key={item.name}>
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.stock} in stock</span>
                </div>
                <span className={`status-pill status-pill--${statusTone[item.status]}`}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="admin-grid-two-bottom">
        <div className="admin-card admin-card--panel">
          <div className="admin-card__head">
            <div>
              <p className="eyebrow eyebrow--light">Recent Orders</p>
              <h2>New orders</h2>
            </div>
          </div>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.customer}</td>
                    <td>{order.amount}</td>
                    <td><span className={`status-pill status-pill--${statusTone[order.status]}`}>{order.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="admin-card admin-card--panel">
          <div className="admin-card__head">
            <div>
              <p className="eyebrow eyebrow--light">Quick Actions</p>
              <h2>Operations</h2>
            </div>
          </div>
          <div className="admin-action-grid">
            {[
              { label: "Add Product", icon: <PlusIcon /> },
              { label: "Manage Orders", icon: <PackageIcon /> },
              { label: "View Customers", icon: <UserIcon /> },
              { label: "Create Discount", icon: <CheckIcon /> },
            ].map((action) => (
              <button type="button" className="admin-action-btn" key={action.label} onClick={() => onAction(`${action.label} triggered`)}>
                <span className="admin-action-btn__icon">{action.icon}</span>
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function OrdersView({ onAction, token }) {
  const exportCsv = () => {
    if (!token) { onAction("Log in to export"); return; }
    fetchAdminCsv("/orders/export", token, "nova-orders.csv")
      .then(() => onAction("Orders CSV downloaded"))
      .catch((err) => onAction(err.message || "Export failed"));
  };
  return (
    <div className="admin-page__content-card">
      <div className="admin-page__header">
        <div>
          <p className="eyebrow eyebrow--light">Commerce</p>
          <h1>Orders</h1>
        </div>
        <button type="button" className="btn btn--light" onClick={exportCsv}>Export CSV</button>
      </div>
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Placed</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.customer}</td>
                <td>Apr 21, 2026</td>
                <td>{order.amount}</td>
                <td>Paid</td>
                <td><span className={`status-pill status-pill--${statusTone[order.status]}`}>{order.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProductsView({ onAction, token }) {
  const exportCsv = () => {
    if (!token) { onAction("Log in to export"); return; }
    fetchAdminCsv("/products/export", token, "nova-products.csv")
      .then(() => onAction("Products CSV downloaded"))
      .catch((err) => onAction(err.message || "Export failed"));
  };
  return (
    <div className="admin-page__content-card">
      <div className="admin-page__header">
        <div>
          <p className="eyebrow eyebrow--light">Catalog</p>
          <h1>Products</h1>
        </div>
        <div className="admin-row-actions">
          <button type="button" className="btn btn--light" onClick={() => onAction("Created product draft")}>Add product</button>
          <button type="button" className="text-action" onClick={exportCsv}>Export CSV</button>
        </div>
      </div>
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {adminProducts.map((product) => (
              <tr key={product.id}>
                <td>
                  <div className="admin-product-cell">
                    <img src={product.image} alt={product.name} />
                    <span>{product.name}</span>
                  </div>
                </td>
                <td>{product.sku}</td>
                <td>{product.category}</td>
                <td>{product.price}</td>
                <td>{product.stock}</td>
                <td><span className={`status-pill status-pill--${statusTone[product.status]}`}>{product.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InventoryView() {
  return (
    <div className="admin-page__content-card">
      <div className="admin-page__header">
        <div>
          <p className="eyebrow eyebrow--light">Inventory</p>
          <h1>Stock overview</h1>
        </div>
        <button type="button" className="btn btn--light">Bulk update</button>
      </div>
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Variant</th>
              <th>Stock</th>
              <th>Threshold</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {inventoryItems.map((item) => (
              <tr key={`${item.name}-${item.variant}`}>
                <td>{item.name}</td>
                <td>{item.variant}</td>
                <td>{item.stock}</td>
                <td>{item.threshold}</td>
                <td><span className={`status-pill status-pill--${statusTone[item.status]}`}>{item.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CustomersView() {
  return (
    <div className="admin-page__content-card">
      <div className="admin-page__header">
        <div>
          <p className="eyebrow eyebrow--light">Commerce</p>
          <h1>Customers</h1>
        </div>
        <button type="button" className="btn btn--light">Export</button>
      </div>
      <div className="admin-customer-grid">
        {adminCustomers.map((customer) => (
          <div className="admin-card admin-customer-card" key={customer.name}>
            <div className="admin-customer-card__avatar">{customer.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</div>
            <h3>{customer.name}</h3>
            <p>{customer.orders} orders</p>
            <div className="admin-customer-card__stats">
              <span>Total spend</span>
              <strong>{customer.spend}</strong>
            </div>
            <small>Last order: {customer.lastOrder}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

function DiscountsView({ token, onAction }) {
  const [coupons, setCoupons] = useState(null);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: "", type: "percent", value: 15, min_order: 0, max_uses: 0, description: "" });
  const [busy, setBusy] = useState(false);

  const load = () => {
    fetchAdminCoupons(token)
      .then((data) => { setCoupons(data); setError(""); })
      .catch((err) => setError(err.message || "Could not load coupons"));
  };
  useEffect(() => { if (token) load(); }, [token]);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      await createAdminCoupon(token, {
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value: Number(form.value) || 0,
        min_order: Number(form.min_order) || 0,
        max_uses: Number(form.max_uses) || 0,
        description: form.description.trim(),
      });
      onAction(`Coupon ${form.code.toUpperCase()} created`);
      setShowForm(false);
      setForm({ code: "", type: "percent", value: 15, min_order: 0, max_uses: 0, description: "" });
      load();
    } catch (err) {
      onAction(err.message || "Could not create coupon");
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (coupon) => {
    try {
      await updateAdminCoupon(token, coupon._id, { is_active: !coupon.is_active });
      load();
    } catch (err) {
      onAction(err.message || "Could not update coupon");
    }
  };

  const remove = async (coupon) => {
    try {
      await deleteAdminCoupon(token, coupon._id);
      onAction(`Coupon ${coupon.code} deleted`);
      load();
    } catch (err) {
      onAction(err.message || "Could not delete coupon");
    }
  };

  const formatValue = (coupon) => {
    if (coupon.type === "percent") return `${coupon.value}% off`;
    if (coupon.type === "fixed") return `$${coupon.value} off`;
    return "Free shipping";
  };

  return (
    <div className="admin-page__content-card">
      <div className="admin-page__header">
        <div>
          <p className="eyebrow eyebrow--light">Commerce</p>
          <h1>Discounts</h1>
        </div>
        <button type="button" className="btn btn--light" onClick={() => setShowForm((open) => !open)}>{showForm ? "Close form" : "Create discount"}</button>
      </div>

      {showForm && (
        <form className="admin-form-grid" onSubmit={submit}>
          <label><span>Code</span><input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="WELCOME15" required minLength={2} maxLength={24} /></label>
          <label><span>Type</span><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option value="percent">Percentage off</option><option value="fixed">Fixed amount off</option><option value="free_shipping">Free shipping</option></select></label>
          <label><span>Value {form.type === "percent" ? "(%)" : form.type === "fixed" ? "($)" : "(unused)"}</span><input type="number" min="0" step="0.01" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} disabled={form.type === "free_shipping"} /></label>
          <label><span>Minimum order ($)</span><input type="number" min="0" value={form.min_order} onChange={(e) => setForm({ ...form, min_order: e.target.value })} /></label>
          <label><span>Max uses (0 = unlimited)</span><input type="number" min="0" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} /></label>
          <label className="admin-form-grid__wide"><span>Description</span><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="15% off your first order" maxLength={160} /></label>
          <div className="admin-form-grid__wide"><button type="submit" className="btn btn--light" disabled={busy}>{busy ? "Creating…" : "Create coupon"}</button></div>
        </form>
      )}

      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="admin-table-wrapper">
        {coupons === null && !error ? <p className="admin-empty-note">Loading coupons…</p> : coupons && coupons.length === 0 ? (
          <p className="admin-empty-note">No coupons yet — create the first one. Try WELCOME15 for the announcement bar.</p>
        ) : coupons && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Min order</th>
                <th>Usage</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon._id}>
                  <td><strong>{coupon.code}</strong>{coupon.description ? <small className="admin-table__sub">{coupon.description}</small> : null}</td>
                  <td>{formatValue(coupon)}</td>
                  <td>{coupon.min_order ? `$${coupon.min_order}` : "—"}</td>
                  <td>{coupon.max_uses ? `${coupon.used_count} / ${coupon.max_uses}` : `${coupon.used_count} / ∞`}</td>
                  <td><span className={`status-pill status-pill--${coupon.is_active ? "success" : "neutral"}`}>{coupon.is_active ? "Active" : "Paused"}</span></td>
                  <td>
                    <div className="admin-row-actions">
                      <button type="button" className="text-action" onClick={() => toggleActive(coupon)}>{coupon.is_active ? "Pause" : "Activate"}</button>
                      <button type="button" className="text-action" onClick={() => remove(coupon)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function GenericListPage({ title, description, items, actionLabel = "Create" }) {
  return (
    <div className="admin-page__content-card">
      <div className="admin-page__header">
        <div>
          <p className="eyebrow eyebrow--light">Catalog</p>
          <h1>{title}</h1>
        </div>
        <button type="button" className="btn btn--light">{actionLabel}</button>
      </div>
      <div className="admin-card-grid">
        {items.length ? items.map((item) => (
          <div className="admin-card admin-entity-card" key={item.title || item.name || item.label}>
            <h3>{item.title || item.name || item.label}</h3>
            <p>{item.meta || item.description || item.value || "Visible in storefront"}</p>
          </div>
        )) : <AdminEmptyState title="Nothing here yet" description={description} />}
      </div>
    </div>
  );
}

function AnalyticsView() {
  return (
    <div className="admin-page__content-card">
      <div className="admin-page__header">
        <div>
          <p className="eyebrow eyebrow--light">Analytics</p>
          <h1>Sales analytics</h1>
        </div>
        <div className="segmented-control">
          {['Today', '7 Days', '30 Days', '3 Months'].map((range) => (
            <button type="button" className={range === '30 Days' ? 'active' : ''} key={range}>{range}</button>
          ))}
        </div>
      </div>
      <div className="admin-kpis-grid admin-kpis-grid--compact">
        {[
          { label: 'Revenue', value: '₹18.4L', change: '+13%' },
          { label: 'Orders', value: '438', change: '+9%' },
          { label: 'AOV', value: '₹4,220', change: '+6%' },
          { label: 'Products Sold', value: '1,284', change: '+15%' },
        ].map((metric) => (
          <div className="admin-card admin-metric admin-metric--compact" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small>{metric.change}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsView({ token, onAction }) {
  const [settings, setSettings] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPublicSettings()
      .then(setSettings)
      .catch((err) => setError(err.message || "Could not load settings"));
  }, []);

  const update = (key) => (event) => setSettings({ ...settings, [key]: event.target.value });

  const save = async () => {
    setBusy(true);
    try {
      const saved = await saveAdminSettings(token, {
        ga4_id: (settings.ga4_id || "").trim(),
        meta_pixel_id: (settings.meta_pixel_id || "").trim(),
        whatsapp_number: (settings.whatsapp_number || "").trim(),
        site_url: (settings.site_url || "").trim(),
      });
      setSettings(saved);
      onAction("Settings saved");
    } catch (err) {
      onAction(err.message || "Could not save settings");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-page__content-card">
      <div className="admin-page__header">
        <div>
          <p className="eyebrow eyebrow--light">Settings</p>
          <h1>Store settings</h1>
        </div>
        <button type="button" className="btn btn--light" onClick={save} disabled={busy || !settings}>{busy ? "Saving…" : "Save changes"}</button>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      {settings && (
        <div className="admin-form-grid">
          <label>
            <span>GA4 Measurement ID</span>
            <input value={settings.ga4_id || ""} onChange={update("ga4_id")} placeholder="G-XXXXXXXXXX" />
          </label>
          <label>
            <span>Meta Pixel ID</span>
            <input value={settings.meta_pixel_id || ""} onChange={update("meta_pixel_id")} placeholder="1234567890" />
          </label>
          <label>
            <span>WhatsApp number (with country code)</span>
            <input value={settings.whatsapp_number || ""} onChange={update("whatsapp_number")} placeholder="+91 98XXXXXXXX" />
          </label>
          <label>
            <span>Canonical site URL (emails &amp; sitemap)</span>
            <input value={settings.site_url || ""} onChange={update("site_url")} placeholder="https://nova.shop" />
          </label>
          <p className="admin-form-grid__wide admin-empty-note">Analytics scripts and the WhatsApp chat button load on the storefront only after these IDs are set. Leave blank to disable.</p>
        </div>
      )}
    </div>
  );
}

function NotificationsView() {
  return (
    <div className="admin-page__content-card">
      <div className="admin-page__header">
        <div>
          <p className="eyebrow eyebrow--light">Operations</p>
          <h1>Notifications</h1>
        </div>
      </div>
      <div className="admin-notification-list">
        {adminNotifications.map((item) => (
          <div className="admin-card admin-notification-item" key={`${item.title}-${item.tag}`}>
            <div>
              <strong>{item.title}</strong>
              <p>{item.detail}</p>
            </div>
            <span>{item.tag}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function renderPage(page, onAction, token) {
  switch (page) {
    case "dashboard":
      return <DashboardView onAction={onAction} />;
    case "orders":
      return <OrdersView onAction={onAction} token={token} />;
    case "products":
      return <ProductsView onAction={onAction} token={token} />;
    case "inventory":
      return <InventoryView />;
    case "customers":
      return <CustomersView />;
    case "discounts":
      return <DiscountsView onAction={onAction} token={token} />;
    case "categories":
      return <GenericListPage title="Categories" description="Manage category hierarchy and visibility." items={[{ title: 'Men', meta: '12 products' }, { title: 'Women', meta: '22 products' }, { title: 'Accessories', meta: '8 products' }]} />;
    case "collections":
      return <GenericListPage title="Collections" description="Manage seasonal and evergreen drops." items={[{ title: 'New Arrivals', meta: 'Active collection' }, { title: 'Streetwear', meta: 'Featured' }, { title: 'Essentials', meta: 'Visible' }]} />;
    case "size-guides":
      return <GenericListPage title="Size Guides" description="Edit fits and measurements per category." items={[{ title: 'Men / Tops', meta: 'Updated 3 days ago' }, { title: 'Women / Dresses', meta: 'Updated this week' }]} />;
    case "shop-the-look":
      return <GenericListPage title="Shop the Look" description="Manage editorial looks and grouped product styling." items={[{ title: 'Weekend Layering', meta: '5 products' }, { title: 'Late Summer', meta: '4 products' }]} />;
    case "homepage":
      return <GenericListPage title="Homepage" description="Hero content, feature products, and promotional placements." items={[{ title: 'Hero Banner', meta: 'Live' }, { title: 'Featured Collection', meta: 'Visible' }]} />;
    case "lookbook":
      return <GenericListPage title="Lookbook" description="Editorial stories and product-linked imagery." items={[{ title: 'Edition 08', meta: 'Published' }, { title: 'The Noon Edit', meta: 'Draft' }]} />;
    case "journal":
      return <GenericListPage title="Journal" description="Create editorial posts and scheduled updates." items={[{ title: 'How to layer', meta: 'Draft' }, { title: 'Material notes', meta: 'Published' }]} />;
    case "reviews":
      return <GenericListPage title="Reviews" description="Moderate product feedback and reports." items={[{ title: 'Pending review', meta: '3 items' }, { title: 'Reported', meta: '1 item' }]} />;
    case "analytics":
      return <AnalyticsView />;
    case "shipping":
      return <GenericListPage title="Shipping" description="Manage shipping zones, charges, and fulfilment methods." items={[{ title: 'Standard', meta: '₹249' }, { title: 'Express', meta: '₹399' }]} />;
    case "payments":
      return <GenericListPage title="Payments" description="Monitor payment methods, statuses, and transaction IDs." items={[{ title: 'Razorpay', meta: 'Live' }, { title: 'COD', meta: 'Enabled' }]} />;
    case "settings":
      return <SettingsView onAction={onAction} token={token} />;
    case "admin":
      return <GenericListPage title="Admin & Permissions" description="Manage roles, access levels, and admin approval flows." items={[{ title: 'SUPER_ADMIN', meta: 'Full access' }, { title: 'CONTENT_MANAGER', meta: 'Content only' }]} />;
    case "notifications":
      return <NotificationsView />;
    case "returns":
      return <GenericListPage title="Returns & Refunds" description="Review return requests and refund status." items={[{ title: 'Pending return', meta: '2 requests' }, { title: 'Refunded', meta: '4 orders' }]} />;
    default:
      return <AdminEmptyState title="Page not ready" description="This route is reserved for the next admin module." />;
  }
}

function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = await adminLogin(email.trim(), password);
      localStorage.setItem("nova_admin_token", data.token);
      localStorage.setItem("nova_admin_user", JSON.stringify(data.user || {}));
      onLogin(data.token, data.user);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="admin-login">
      <form className="admin-login__card" onSubmit={submit}>
        <p className="eyebrow eyebrow--light">NOVA / ADMIN</p>
        <h1>Sign in to manage the store</h1>
        <p className="admin-login__hint">Coupons, settings and CSV exports need an admin account. Other pages stay viewable.</p>
        <label>
          <span>Email</span>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
        </label>
        <label>
          <span>Password</span>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
        </label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button type="submit" className="btn btn--light" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
      </form>
    </main>
  );
}

export default function AdminApp({ route = "admin", onNavigate }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem("nova_admin_token") || "");
  const [adminUser, setAdminUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("nova_admin_user") || "null"); } catch { return null; }
  });
  const [loginOpen, setLoginOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("nova_admin_token");
    localStorage.removeItem("nova_admin_user");
    setAdminToken("");
    setAdminUser(null);
    setLoginOpen(false);
    setToast("Logged out");
  };

  const page = useMemo(() => {
    const cleanRoute = route.replace(/^admin\/?/, "") || "dashboard";
    return cleanRoute.split("/")[0] || "dashboard";
  }, [route]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 420);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(timer);
  }, [toast]);

  const activeTitle = adminTitleMap[page] || "Dashboard";

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${isCollapsed ? "is-collapsed" : ""} ${mobileOpen ? "is-open" : ""}`}>
        <div className="admin-sidebar__header">
          <div className="admin-brand">
            <span className="admin-brand__mark">≡</span>
            {!isCollapsed && <span className="admin-brand__word">NOVA</span>}
          </div>
          <button type="button" className="admin-icon-button admin-icon-button--desktop" onClick={() => setIsCollapsed((value) => !value)} aria-label="Toggle sidebar">
            <ChevronIcon direction={isCollapsed ? "right" : "left"} />
          </button>
          <button type="button" className="admin-icon-button admin-icon-button--mobile" onClick={closeMobile} aria-label="Close menu">
            <CloseIcon />
          </button>
        </div>

        <nav className="admin-nav" aria-label="Admin navigation">
          {adminNavGroups.map((group) => (
            <div className="admin-nav-group" key={group.group}>
              {!isCollapsed && <p className="admin-nav-group__label">{group.group}</p>}
              {group.items.map((item) => (
                <button
                  type="button"
                  className={`admin-nav-item ${page === item.id ? "is-active" : ""}`}
                  key={item.id}
                  onClick={() => {
                    onNavigate(`admin/${item.id === "dashboard" ? "" : item.id}`);
                    closeMobile();
                  }}
                  title={isCollapsed ? item.label : undefined}
                >
                  <span className="admin-nav-item__icon">
                    {item.id === "dashboard" && <HomeIcon />}
                    {item.id === "orders" && <PackageIcon />}
                    {item.id === "products" && <BoxIcon />}
                    {item.id === "inventory" && <TruckIcon />}
                    {item.id === "customers" && <UserIcon />}
                    {item.id === "discounts" && <CheckIcon />}
                    {item.id === "returns" && <ShieldIcon />}
                    {item.id === "categories" && <BoxIcon />}
                    {item.id === "collections" && <PackageIcon />}
                    {item.id === "size-guides" && <HomeIcon />}
                    {item.id === "shop-the-look" && <ArrowIcon />}
                    {item.id === "homepage" && <HomeIcon />}
                    {item.id === "lookbook" && <PackageIcon />}
                    {item.id === "journal" && <BellIcon />}
                    {item.id === "reviews" && <CheckIcon />}
                    {item.id === "analytics" && <ArrowIcon />}
                    {item.id === "shipping" && <TruckIcon />}
                    {item.id === "payments" && <ShieldIcon />}
                    {item.id === "settings" && <HomeIcon />}
                    {item.id === "admin" && <UserIcon />}
                    {item.id === "notifications" && <BellIcon />}
                  </span>
                  {!isCollapsed && <span>{item.label}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar__left">
            <button type="button" className="admin-icon-button admin-icon-button--mobile" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <MenuIcon />
            </button>
            <div className="admin-search">
              <SearchIcon />
              <input type="search" placeholder="Search products, orders, customers..." />
              <span className="admin-search__shortcut">⌘K</span>
            </div>
          </div>
          <div className="admin-topbar__right">
            <button type="button" className="admin-icon-button" aria-label="Notifications">
              <BellIcon />
              <span className="admin-indicator">4</span>
            </button>
            <div className="admin-user-pill">
              <div className="admin-user-pill__avatar">{(adminUser?.name || "AD").slice(0, 2).toUpperCase()}</div>
              <div className="admin-user-pill__meta">
                <strong>{adminUser?.name || "Admin"}</strong>
                <span>{adminUser?.role || "Not signed in"}</span>
              </div>
              {adminToken
                ? <button type="button" className="text-action" onClick={logout}>Log out</button>
                : <button type="button" className="text-action" onClick={() => setLoginOpen(true)}>Sign in</button>}
            </div>
          </div>
        </header>

        <div className="admin-main__content">
          {toast && <div className="admin-toast">{toast}</div>}
          {loginOpen && !adminToken && (
            <AdminLogin
              onLogin={(token, user) => { setAdminToken(token); setAdminUser(user); setLoginOpen(false); setToast(`Welcome, ${user?.name || "admin"}`); }}
            />
          )}
          {isLoading ? <AdminSkeleton /> : renderPage(page, (message) => setToast(message), adminToken)}
        </div>
      </main>
    </div>
  );
}
