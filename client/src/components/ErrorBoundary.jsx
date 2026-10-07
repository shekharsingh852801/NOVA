import React from "react";
import { ArrowIcon } from "./Icons.jsx";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught an error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary__content">
            <h2 className="section-heading">Oops, something went wrong.</h2>
            <p>We hit a snag loading this section of the site. Please try refreshing the page, or continue exploring the rest of our collections.</p>
            <button
              className="btn btn--dark"
              onClick={() => {
                this.setState({ hasError: false });
                window.location.hash = "#/";
              }}
            >
              Go to Home <ArrowIcon />
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
