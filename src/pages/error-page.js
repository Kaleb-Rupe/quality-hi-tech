import React from 'react';
import { useRouteError, Link } from 'react-router-dom';
import '../css/error-page.css';

const ErrorPage = () => {
  const error = useRouteError();

  return (
    <div className="error-page">
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p className="error-details">
        <i>{error.statusText || error.message}</i>
      </p>
      <Link to="/" className="back-link">Go back to homepage</Link>
    </div>
  );
};

export default ErrorPage;