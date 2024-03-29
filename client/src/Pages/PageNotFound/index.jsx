import React from 'react'
import './404.css'
import { Link } from 'react-router-dom';

const PageNotFound = () => {


  // return (
  //  <>
  //   <h1>PAGE NOT FOUND</h1>
  //   <hr />
  //  </>
  // )
  return(<>
  
<div className="main-container">
  <main className="main-content main-content.sm main-content.lg">
    <div className="text-section">
      <p className="error-code">404</p>
      <h1 className="error-title error-title.sm">Page not found</h1>
      <p className="error-description">
        Sorry, we couldn't find the page you're looking for.
      </p>
      <div className="button-container">
        <Link to='/chat'>
          Go Back Home
        </Link>
      </div>
    </div>
  </main>
</div>
  </>)
  
}

export default PageNotFound;