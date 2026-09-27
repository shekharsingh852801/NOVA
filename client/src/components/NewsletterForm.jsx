import { useState } from "react";
import { subscribeToNewsletter } from "../api/api.js";
import { CheckIcon } from "./Icons.jsx";

export default function NewsletterForm({ source = "newsletter-section", variant = "light" }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    try {
      const res = await subscribeToNewsletter(email.trim(), source);
      setStatus("success");
      setMessage(res.message || "Subscribed!");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(err.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <form
      className={`newsletter-form newsletter-form--${variant}`}
      onSubmit={handleSubmit}
      noValidate
    >
      <label htmlFor={`newsletter-email-${source}`} className="sr-only">
        Email address
      </label>
      <input
        id={`newsletter-email-${source}`}
        type="email"
        required
        placeholder="Enter your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={status === "loading"}
      />
      <button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Subscribing…" : status === "success" ? <><CheckIcon /> Subscribed</> : "Subscribe"}
      </button>
      {message && (
        <p className={`newsletter-form__message newsletter-form__message--${status}`} role="status">
          {message}
        </p>
      )}
    </form>
  );
}
