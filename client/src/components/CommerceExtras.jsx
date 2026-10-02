import { useEffect, useState } from "react";
import { shopProducts } from "../data/products.js";
import { useStore } from "../context/StoreContext.jsx";
import { readStoredJson, writeStoredJson } from "../utils/storage.js";
import { createBackInStockRequest, createContactRequest, isApiConfigured } from "../api/api.js";
import { ArrowIcon, CloseIcon, StarIcon } from "./Icons.jsx";

function readProfile() {
  return readStoredJson("nova-profile", {});
}

const formatPrice = (value) => `$${Number(value || 0).toFixed(2)}`;
const money = formatPrice;

export function CheckoutPage({ onPlaceOrder }) {
  const { cart, addresses } = useStore();
  const profile = readProfile();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [form, setForm] = useState({ name: profile.name || "", email: profile.email || "", phone: "", address: "", city: "", state: "", postal: "", payment: "Cash on delivery" });
  const lines = cart.map((line) => ({ ...line, product: shopProducts.find((product) => product.id === line.id) })).filter((line) => line.product);
  const subtotal = lines.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal >= 75 || subtotal === 0 ? 0 : 8;
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const useAddress = (event) => {
    const address = addresses.find((item) => item.id === event.target.value);
    setSelectedAddress(event.target.value);
    if (address) setForm((current) => ({ ...current, name: current.name || address.recipient, address: address.address, city: address.city, state: address.state, postal: address.postal }));
  };
  const continueStep = () => {
    if (step === 0 && (!form.name.trim() || !form.email.trim() || !form.phone.trim())) { setError("Please complete your contact details."); return; }
    if (step === 1 && (!form.address.trim() || !form.city.trim() || !form.state.trim() || !form.postal.trim())) { setError("Please complete your shipping address."); return; }
    setError("");
    setStep((current) => current + 1);
  };
  const submitOrder = async () => {
    setError("");
    setPlacing(true);
    try {
      await onPlaceOrder({ form, lines, subtotal, shipping });
    } catch (submitError) {
      setError(submitError.message || "We couldn't place the order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  return <main className="commerce-page checkout-page">
    <p className="eyebrow eyebrow--dark">NOVA / CHECKOUT</p>
    <h1>Make it yours.</h1>
    <div className="checkout-steps">{["Information", "Shipping", "Payment", "Review"].map((label, index) => <button type="button" key={label} className={step === index ? "is-current" : step > index ? "is-done" : ""} onClick={() => index < step && setStep(index)}>{String(index + 1).padStart(2, "0")} <span>{label}</span></button>)}</div>
    <div className="checkout-layout">
      <form className="checkout-form" onSubmit={(event) => event.preventDefault()}>
        {step === 0 && <>
          <div className="checkout-form__title"><h2>Contact information</h2><span>Guest checkout</span></div>
          <label>Full name<input name="name" autoComplete="name" value={form.name} onChange={update} required /></label>
          <label>Email address<input name="email" type="email" autoComplete="email" value={form.email} onChange={update} required /></label>
          <label>Phone number<input name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={update} required /></label>
        </>}
        {step === 1 && <>
          <div className="checkout-form__title"><h2>Shipping address</h2><button type="button" className="text-action" onClick={() => setStep(0)}>Edit contact details</button></div>
          {addresses.length > 0 && <label>Use a saved address<select value={selectedAddress} onChange={useAddress}><option value="">Enter a new address</option>{addresses.map((address) => <option key={address.id} value={address.id}>{address.label} · {address.address}, {address.city}</option>)}</select></label>}
          <label>Street address<input name="address" autoComplete="street-address" value={form.address} onChange={update} required /></label>
          <div className="checkout-form__row"><label>City<input name="city" autoComplete="address-level2" value={form.city} onChange={update} required /></label><label>State / region<input name="state" autoComplete="address-level1" value={form.state} onChange={update} required /></label></div>
          <label>Postal code<input name="postal" autoComplete="postal-code" value={form.postal} onChange={update} required /></label>
        </>}
        {step === 2 && <>
          <div className="checkout-form__title"><h2>Payment</h2><span>Demo options</span></div>
          {["Cash on delivery", "Pay on delivery"].map((option) => <label className="payment-choice" key={option}><input type="radio" name="payment" value={option} checked={form.payment === option} onChange={update} />{option}<span>No online payment is processed in this preview.</span></label>)}
          <p className="checkout-note">A payment provider must be connected before real orders can be placed.</p>
        </>}
        {step === 3 && <>
          <div className="checkout-form__title"><h2>Review your order</h2><button type="button" className="text-action" onClick={() => setStep(0)}>Edit details</button></div>
          <p className="review-contact">{form.name}<br />{form.email} · {form.phone}<br />{form.address}, {form.city}, {form.state} {form.postal}</p>
          <p className="checkout-note">Payment: {form.payment}. {isApiConfigured() ? "The order will be recorded with payment pending; no online payment is processed." : "This creates a local demo order only; no payment will be charged."}</p>
        </>}
        {error && <p className="form-error" role="alert">{error}</p>}
        {step < 3 ? <button className="btn btn--dark checkout-continue" type="button" onClick={continueStep}>Continue to {step === 0 ? "shipping" : step === 1 ? "payment" : "review"} <ArrowIcon /></button> : <button className="btn btn--dark checkout-continue" type="button" disabled={!lines.length || placing} onClick={submitOrder}>{placing ? "Placing order…" : `${isApiConfigured() ? "Place order" : "Place demo order"} · ${formatPrice(subtotal + shipping)}`} <ArrowIcon /></button>}
      </form>
      <aside className="checkout-summary">
        <div className="checkout-summary__heading"><h2>Your edit</h2><span>{lines.reduce((sum, line) => sum + line.quantity, 0)} pieces</span></div>
        {lines.map(({ product, size, color, quantity }) => <div className="checkout-summary__item" key={`${product.id}-${size}-${color}`}><img src={product.images[0]} alt={product.name} /><div><span>{product.name}</span><small>Size {size} · {color} · Qty {quantity}</small></div><strong>{formatPrice(product.price * quantity)}</strong></div>)}
        {!lines.length && <p className="muted-copy">Your bag is empty.</p>}
        <div className="checkout-summary__totals"><p><span>Subtotal</span><span>{formatPrice(subtotal)}</span></p><p><span>Shipping</span><span>{shipping ? formatPrice(shipping) : "Complimentary"}</span></p><p className="checkout-summary__total"><strong>Total</strong><strong>{formatPrice(subtotal + shipping)}</strong></p></div>
      </aside>
    </div>
  </main>;
}

function formatOrderDate(value) {
  const safeDate = new Date(value);
  if (Number.isNaN(safeDate.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(safeDate);
}

function getTrackingSummary(order = {}) {
  const status = (order.status || "Confirmed").toLowerCase();
  if (status.includes("cancel")) return { label: "Cancelled", progress: 0, note: "This order was cancelled before dispatch." };
  if (status.includes("fail")) return { label: "Failed", progress: 0, note: "This order could not be completed and requires attention." };
  if (status.includes("delay")) return { label: "Delayed", progress: 3, note: "This order is running behind the standard shipping window." };
  if (status.includes("delivered")) return { label: "Delivered", progress: 5, note: "Your order has arrived." };
  if (status.includes("out for delivery")) return { label: "Out for delivery", progress: 4, note: "The courier is on the final leg of delivery." };
  if (status.includes("shipped")) return { label: "Shipped", progress: 3, note: "Your order has left NOVA and is in transit." };
  if (status.includes("processing")) return { label: "Processing", progress: 2, note: "Your order is being packed and prepared for dispatch." };
  if (status.includes("confirmed")) return { label: "Confirmed", progress: 1, note: "Your order has been confirmed and is in queue." };
  if (status.includes("placed")) return { label: "Order placed", progress: 1, note: "Your order has been placed and we’re preparing it." };
  return { label: order.status || "Confirmed", progress: 2, note: order.status || "Order confirmed." };
}

export function OrdersPage({ orders = [], onNavigate }) {
  const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0));

  return (
    <main className="commerce-page account-page">
      <p className="eyebrow eyebrow--dark">NOVA / ORDERS</p>
      <h1>Your order history.</h1>
      <p className="page-lede">Every order, from the edit you made earlier to the one arriving next.</p>

      {sortedOrders.length ? (
        <div className="account-layout">
          <nav aria-label="Account sections">
            <a href="#/account">Overview</a>
            <a href="#/account/orders">Orders</a>
            <a href="#/wishlist">Wishlist</a>
            <a href="#/tracking">Track order</a>
          </nav>
          <div className="account-content" style={{ gridTemplateColumns: "1fr" }}>
            {sortedOrders.map((order) => {
              const itemCount = (order.lines || []).reduce((sum, line) => sum + Number(line.quantity || 0), 0);
              const firstItem = (order.lines || [])[0];
              const product = firstItem?.product || shopProducts.find((item) => item.id === firstItem?.id) || null;
              const tracking = getTrackingSummary(order);

              return (
                <article className="account-order" key={order.id} style={{ display: "grid", gridTemplateColumns: "88px 1fr auto", gap: "18px", alignItems: "center", padding: "18px 0" }}>
                  <img src={product?.images?.[0] || shopProducts[0].images[0]} alt={product?.name || "Order item"} style={{ width: "88px", height: "110px", objectFit: "cover" }} />
                  <div style={{ display: "grid", gap: "6px" }}>
                    <strong style={{ fontSize: "12px" }}>#{order.id}</strong>
                    <span style={{ color: "var(--muted-on-light)", fontSize: "11px" }}>{formatOrderDate(order.createdAt || order.date || new Date())}</span>
                    <span style={{ fontSize: "11px" }}>{itemCount} item{itemCount === 1 ? "" : "s"} · {order.status || tracking.label}</span>
                  </div>
                  <div style={{ display: "grid", justifyItems: "end", gap: "10px" }}>
                    <strong style={{ fontSize: "12px" }}>{money(order.total || 0)}</strong>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button type="button" className="text-action" onClick={() => onNavigate(`account/orders/${order.id}`)}>View details</button>
                      <button type="button" className="text-action" onClick={() => onNavigate("tracking")}>Track order</button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-state__rule" />
          <h2>No orders yet.</h2>
          <p>Start with a considered piece and your first NOVA order will appear here.</p>
          <button type="button" className="text-action" onClick={() => onNavigate("shop")}>Explore the collection <ArrowIcon /></button>
        </div>
      )}
    </main>
  );
}

export function OrderDetailPage({ orderId, orders = [], onNavigate }) {
  const order = orders.find((item) => item.id === orderId);
  const tracking = getTrackingSummary(order);

  if (!order) {
    return (
      <main className="commerce-page account-page">
        <p className="eyebrow eyebrow--dark">NOVA / ORDER</p>
        <h1>Order not found.</h1>
        <p className="page-lede">We couldn’t match that order reference. Try a recent order or head back to your account.</p>
        <div style={{ display: "flex", gap: "18px", flexWrap: "wrap" }}>
          <button type="button" className="btn btn--dark" onClick={() => onNavigate("account/orders")}>Back to orders <ArrowIcon /></button>
          <button type="button" className="text-action" onClick={() => onNavigate("account")}>Account overview</button>
        </div>
      </main>
    );
  }

  const subtotal = (order.lines || []).reduce((sum, line) => sum + (line.product?.price || 0) * Number(line.quantity || 0), 0);
  const shipping = subtotal >= 75 || subtotal === 0 ? 0 : 8;
  const total = Number(order.total || subtotal + shipping);
  const steps = ["Order placed", "Confirmed", "Processing", "Shipped", "Out for delivery", "Delivered"];
  const detail = (order.shippingAddress || {});

  return (
    <main className="commerce-page account-page">
      <p className="eyebrow eyebrow--dark">NOVA / ORDER DETAILS</p>
      <h1>#{order.id}</h1>
      <p className="page-lede">Placed {formatOrderDate(order.createdAt || order.date || new Date())} · {order.status || tracking.label}</p>

      <div className="account-layout">
        <nav aria-label="Account sections">
          <a href="#/account">Overview</a>
          <a href="#/account/orders">Orders</a>
          <a href="#/wishlist">Wishlist</a>
          <a href="#/tracking">Track order</a>
        </nav>

        <div className="account-content" style={{ gridTemplateColumns: "1fr" }}>
          <section>
            <h2>Order status</h2>
            <div className="tracking-result" style={{ marginTop: 0 }}>
              <p className="eyebrow eyebrow--dark">Current status</p>
              <h2>{tracking.label}</h2>
              <p className="muted-copy" style={{ marginTop: "10px" }}>{tracking.note}</p>
              <div className="tracking-timeline" style={{ marginTop: "24px" }}>
                {steps.map((status, index) => (
                  <div key={status} className={index <= tracking.progress ? "is-complete" : ""}>
                    <i />
                    <span>{status}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section>
            <h2>Items</h2>
            {(order.lines || []).map((line) => {
              const product = line.product || shopProducts.find((item) => item.id === line.id) || shopProducts[0];
              return (
                <div className="checkout-summary__item" key={`${line.id}-${line.size}-${line.color}`} style={{ gridTemplateColumns: "56px 1fr auto" }}>
                  <img src={product.images[0]} alt={product.name} />
                  <div>
                    <span>{product.name}</span>
                    <small>Size {line.size} · {line.color} · Qty {line.quantity}</small>
                  </div>
                  <strong>{money((product.price || 0) * Number(line.quantity || 0))}</strong>
                </div>
              );
            })}
          </section>

          <section>
            <h2>Order summary</h2>
            <div className="checkout-summary__totals" style={{ marginTop: 0 }}>
              <p><span>Subtotal</span><span>{money(subtotal)}</span></p>
              <p><span>Shipping</span><span>{shipping ? money(shipping) : "Complimentary"}</span></p>
              <p><span>Payment</span><span>{order.paymentMethod || "Cash on delivery"}</span></p>
              <p className="checkout-summary__total"><strong>Total</strong><strong>{money(total)}</strong></p>
            </div>
          </section>

          <section>
            <h2>Shipping details</h2>
            <div className="review-contact">
              <strong>{order.name || "Customer"}</strong><br />
              {detail.address || "Address not available"}<br />
              {detail.city || "City not available"}, {detail.state || ""} {detail.postal || ""}
            </div>
            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginTop: "14px" }}>
              <button type="button" className="btn btn--dark" onClick={() => onNavigate("tracking")}>Track order <ArrowIcon /></button>
              <button type="button" className="text-action" onClick={() => onNavigate("account/orders")}>Back to orders</button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export function AccountPage({ onNavigate }) {
  const { orders, wishlist, recentlyViewed, addresses, stockNotifications, contactRequests, addAddress, removeAddress } = useStore();
  const [profile, setProfile] = useState(readProfile);
  const [profileSaved, setProfileSaved] = useState(false);
  const [session, setSession] = useState(() => readStoredJson("nova-account-session", { mode: "guest" }));
  const [addressForm, setAddressForm] = useState({ label: "Home", recipient: "", address: "", city: "", state: "", postal: "" });
  const [addressError, setAddressError] = useState("");
  const recentProducts = recentlyViewed.map((id) => shopProducts.find((product) => product.id === id)).filter(Boolean);

  const saveProfile = (event) => {
    event.preventDefault();
    writeStoredJson("nova-profile", profile);
    writeStoredJson("nova-account-session", { ...session, mode: "member" });
    setSession({ ...session, mode: "member" });
    setProfileSaved(true);
  };

  const saveAddress = (event) => {
    event.preventDefault();
    if (!addressForm.recipient.trim() || !addressForm.address.trim() || !addressForm.city.trim() || !addressForm.state.trim() || !addressForm.postal.trim()) {
      setAddressError("Complete each address field before saving.");
      return;
    }
    addAddress(addressForm);
    setAddressForm({ label: "Home", recipient: "", address: "", city: "", state: "", postal: "" });
    setAddressError("");
  };

  const handleLogout = () => {
    writeStoredJson("nova-account-session", { mode: "guest" });
    setSession({ mode: "guest" });
    onNavigate("shop");
  };

  return <main className="commerce-page account-page">
    <p className="eyebrow eyebrow--dark">NOVA / YOUR ACCOUNT</p>
    <h1>Your space.</h1>
    <p className="page-lede">A personal place for your details, orders, and pieces on your list.</p>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "18px", paddingBottom: "18px", borderBottom: "1px solid var(--line-on-light)" }}>
      <span style={{ color: "var(--muted-on-light)", fontSize: "11px" }}>{session.mode === "member" ? "NOVA member preview" : "Guest preview"}</span>
      <button type="button" className="text-action" onClick={handleLogout}>Logout</button>
    </div>
    <div className="account-layout">
      <nav aria-label="Account sections"><a href="#account-profile">Profile</a><a href="#/account/orders">Orders</a><a href="#/wishlist">Wishlist ({wishlist.length})</a><a href="#account-preferences">Size preferences</a><a href="#account-addresses">Addresses</a><a href="#account-requests">Requests</a><a href="#account-recent">Recently viewed</a></nav>
      <div className="account-content">
        <section id="account-profile">
          <h2>Profile details</h2>
          <form className="account-form" onSubmit={saveProfile}>
            <label>Name<input name="name" value={profile.name || ""} onChange={(event) => { setProfile({ ...profile, name: event.target.value }); setProfileSaved(false); }} placeholder="Your name" autoComplete="name" required /></label>
            <label>Email<input name="email" type="email" value={profile.email || ""} onChange={(event) => { setProfile({ ...profile, email: event.target.value }); setProfileSaved(false); }} placeholder="you@example.com" autoComplete="email" required /></label>
            <label>Phone<input name="phone" type="tel" value={profile.phone || ""} onChange={(event) => { setProfile({ ...profile, phone: event.target.value }); setProfileSaved(false); }} placeholder="+1 (555) 123-4567" autoComplete="tel" /></label>
            <button className="btn btn--dark">Save profile</button>
            {profileSaved && <span className="inline-confirmation" role="status">Profile saved on this device.</span>}
          </form>
        </section>
        <section id="account-orders">
          <h2>Recent orders</h2>
          {orders.length ? orders.slice(0, 3).map((order) => <div className="account-order" key={order.id}><span>{order.id}</span><span>{order.status || "Confirmed"}</span><button className="text-action" onClick={() => onNavigate(`account/orders/${order.id}`)}>View</button></div>) : <p className="muted-copy">Your orders will appear here.</p>}
          {orders.length > 0 && <button className="text-action" onClick={() => onNavigate("account/orders")}>View all orders <ArrowIcon /></button>}
        </section>
        <section id="account-preferences">
          <h2>Size preferences</h2>
          <label>Usual top size<select name="size" value={profile.size || "M"} onChange={(event) => { setProfile({ ...profile, size: event.target.value }); setProfileSaved(false); }}>{["XS", "S", "M", "L", "XL"].map((size) => <option key={size}>{size}</option>)}</select></label>
          <p className="muted-copy">Save your profile to keep this preference on this device.</p>
        </section>
        <section id="account-addresses" className="account-addresses">
          <h2>Saved addresses</h2>
          {addresses.map((address) => <article className="saved-address" key={address.id}><div><strong>{address.label}</strong><p>{address.recipient}<br />{address.address}<br />{address.city}, {address.state} {address.postal}</p></div><button className="text-action" onClick={() => removeAddress(address.id)} aria-label={`Remove ${address.label} address`}>Remove</button></article>)}
          <form className="account-form account-address-form" onSubmit={saveAddress}>
            <label>Address label<select value={addressForm.label} onChange={(event) => setAddressForm({ ...addressForm, label: event.target.value })}><option>Home</option><option>Work</option><option>Other</option></select></label>
            <label>Recipient<input value={addressForm.recipient} onChange={(event) => setAddressForm({ ...addressForm, recipient: event.target.value })} autoComplete="name" required /></label>
            <label>Street address<input value={addressForm.address} onChange={(event) => setAddressForm({ ...addressForm, address: event.target.value })} autoComplete="street-address" required /></label>
            <div className="checkout-form__row"><label>City<input value={addressForm.city} onChange={(event) => setAddressForm({ ...addressForm, city: event.target.value })} autoComplete="address-level2" required /></label><label>State<input value={addressForm.state} onChange={(event) => setAddressForm({ ...addressForm, state: event.target.value })} autoComplete="address-level1" required /></label></div>
            <label>Postal code<input value={addressForm.postal} onChange={(event) => setAddressForm({ ...addressForm, postal: event.target.value })} autoComplete="postal-code" required /></label>
            {addressError && <p className="form-error" role="alert">{addressError}</p>}
            <button className="btn btn--dark">Save address</button>
          </form>
        </section>
        <section id="account-requests">
          <h2>Requests</h2>
          {stockNotifications.length ? stockNotifications.slice(0, 3).map((request) => <div className="account-order" key={request.id}><span>{request.productName}</span><span>Back-in-stock alert · {request.email}</span></div>) : null}
          {contactRequests.length ? contactRequests.slice(0, 3).map((request) => <div className="account-order" key={request.id}><span>{request.topic}</span><span>Saved locally · {request.email}</span></div>) : null}
          {!stockNotifications.length && !contactRequests.length && <p className="muted-copy">Your saved contact and availability requests will appear here.</p>}
          {(stockNotifications.length > 0 || contactRequests.length > 0) && <p className="review-preview-note">Requests are stored on this device and haven't been delivered to NOVA support.</p>}
        </section>
        <section id="account-recent">
          <h2>Recently viewed</h2>
          {recentProducts.length ? <div className="account-recent-grid">{recentProducts.map((product) => <a href={`#/product/${product.slug}`} key={product.id}><img src={product.images[0]} alt={product.name} loading="lazy" /><span>{product.name}</span></a>)}</div> : <p className="muted-copy">Pieces you view will appear here.</p>}
          <button className="text-action" onClick={() => onNavigate("shop")}>Explore the collection <ArrowIcon /></button>
        </section>
      </div>
    </div>
  </main>;
}

export function ContactPage() {
  const { saveContactRequest } = useStore();
  const [form, setForm] = useState({ name: "", email: "", topic: "Order enquiry", message: "" });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const update = (event) => { setForm({ ...form, [event.target.name]: event.target.value }); setSaved(false); };
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      if (isApiConfigured()) await createContactRequest(form);
      saveContactRequest(form);
      setSaved(true);
      setForm({ ...form, message: "" });
    } catch (submitError) {
      setError(submitError.message || "We couldn't save your message. Please try again.");
    }
  };
  return <main className="commerce-page contact-page"><div><p className="eyebrow eyebrow--dark">We are here to help</p><h1>Get in touch.</h1><p className="page-lede">Questions about a piece, an order, or anything else? Leave us a note.</p><p>Monday to Friday · 9am–5pm<br />hello@nova.example</p></div><form onSubmit={submit}><label>Your name<input name="name" autoComplete="name" value={form.name} onChange={update} required /></label><label>Email address<input name="email" type="email" autoComplete="email" value={form.email} onChange={update} required /></label><label>What can we help with?<select name="topic" value={form.topic} onChange={update}><option>Order enquiry</option><option>Product question</option><option>Returns</option><option>Something else</option></select></label><label>Your message<textarea name="message" rows="5" value={form.message} onChange={update} required /></label><button className="btn btn--dark">Save message <ArrowIcon /></button>{error && <p className="form-error" role="alert">{error}</p>}{saved && <p className="inline-confirmation" role="status">{isApiConfigured() ? "Request received. Support email delivery is not configured." : "Saved in this browser. Support delivery isn't configured yet."}</p>}</form></main>;
}

export function ProductReviewPanel({ product }) {
  const { customerReviews, saveReview } = useStore();
  const [form, setForm] = useState({ name: "", email: "", rating: 5, body: "" });
  const [saved, setSaved] = useState(false);
  const reviews = customerReviews.filter((review) => review.productId === product.id);
  const reviewCount = product.reviews + reviews.length;
  const averageRating = reviewCount
    ? (product.rating * product.reviews + reviews.reduce((sum, review) => sum + review.rating, 0)) / reviewCount
    : product.rating;
  const submit = (event) => {
    event.preventDefault();
    saveReview({ ...form, productId: product.id });
    setForm({ ...form, body: "" });
    setSaved(true);
  };
  return <section id="reviews" className="product-reviews">
    <div><p className="eyebrow eyebrow--dark">The NOVA community</p><h2>Worn and loved</h2><p className="review-score">{averageRating.toFixed(1)} <StarIcon /> <span>Based on {reviewCount} reviews</span></p><div className="review-breakdown">{[5, 4, 3, 2, 1].map((stars, index) => <div key={stars}><span>{stars} <StarIcon /></span><i><b style={{ width: `${[82, 13, 4, 1, 0][index]}%` }} /></i><small>{[82, 13, 4, 1, 0][index]}%</small></div>)}</div><p className="review-preview-note">Preview reviews are saved locally and are not verified purchases.</p></div>
    <div className="review-write"><h3>Share your experience</h3><form onSubmit={submit}><label>Your name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} autoComplete="name" required /></label><label>Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} autoComplete="email" required /></label><label>Rating<select value={form.rating} onChange={(event) => setForm({ ...form, rating: Number(event.target.value) })}>{[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} stars</option>)}</select></label><label>Your review<textarea value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} rows="3" minLength="10" required /></label><button className="btn btn--dark">Save review</button>{saved && <p className="inline-confirmation" role="status">Review saved on this device. Verification isn't available in preview.</p>}</form></div>
    <div className="review-quote"><p>“The quality is even better in person. An easy piece that has already become part of my weekly rotation.”</p><span>Sample review · Not verified</span><div className="review-customer-photos"><img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=220&q=80" alt="Customer styling NOVA" loading="lazy" /><img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=220&q=80" alt="Customer outfit detail" loading="lazy" /></div></div>
    <div className="review-list">{reviews.map((review) => <article key={review.id}><p className="review-list__rating">{review.rating} <StarIcon /></p><p>{review.body}</p><span>{review.name} · Preview review, not verified</span></article>)}</div>
  </section>;
}

export function BackInStockForm({ product }) {
  const { saveStockNotification, stockNotifications } = useStore();
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const alreadySaved = stockNotifications.some((request) => request.productId === product.id && request.email.toLowerCase() === email.trim().toLowerCase());
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      if (isApiConfigured()) await createBackInStockRequest(email.trim(), product.slug);
      saveStockNotification({ productId: product.id, productName: product.name, email: email.trim() });
      setSaved(true);
    } catch (submitError) {
      setError(submitError.message || "We couldn't save the request. Please try again.");
    }
  };
  return <form className="notify-stock" onSubmit={submit}><label htmlFor={`stock-email-${product.id}`}>Notify me when it returns</label><div><input id={`stock-email-${product.id}`} type="email" placeholder="Email address" value={email} onChange={(event) => { setEmail(event.target.value); setSaved(false); setError(""); }} required /><button type="submit">Notify me</button></div>{error && <p className="form-error" role="alert">{error}</p>}{saved && <p role="status">{isApiConfigured() ? "Request saved. Email delivery isn't configured yet." : "Saved on this device. Email delivery isn't configured yet."}</p>}{alreadySaved && !saved && <p role="status">This email is already on the local notification list.</p>}</form>;
}

export function FilmModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open, onClose]);
  if (!open) return null;
  const filmUrl = import.meta.env.VITE_BRAND_FILM_URL;
  const poster = shopProducts[0].images[1];
  return <div className="modal-backdrop film-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="film-modal" role="dialog" aria-modal="true" aria-label="NOVA brand film"><button className="icon-close film-modal__close" onClick={onClose} aria-label="Close film"><CloseIcon /></button>{filmUrl ? <video controls autoPlay playsInline poster={poster}><source src={filmUrl} /></video> : <><img src={poster} alt="NOVA Winter '26 editorial" /><div className="film-modal__copy"><p className="eyebrow">NOVA / WINTER '26</p><h2>A film for the in-between.</h2><p>The brand film isn't configured yet. Explore the collection while we prepare it.</p><a className="btn btn--light" href="#/collections/winter-26" onClick={onClose}>Explore Winter '26 <ArrowIcon /></a></div></>}</section></div>;
}