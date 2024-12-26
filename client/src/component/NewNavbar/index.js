import React from "react";
import "./style.css";
import { useNavigate } from "react-router-dom";

const NewNavbar = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    let prevScrollPos = window.scrollY;
    let isScrolling = false;

    const handleScroll = () => {
      if (!isScrolling) {
        window.requestAnimationFrame(() => {
          const currentScrollPos = window.scrollY;
          const navbar = document.querySelector('.new-navbar');

          // Always show navbar at the top of the page
          if (currentScrollPos === 0) {
            navbar.classList.add('show');
          }
          // Show navbar when scrolling up
          else if (prevScrollPos > currentScrollPos + 5) {
            navbar.classList.add('show');
          }
          // Hide navbar when scrolling down
          else if (prevScrollPos < currentScrollPos - 5) {
            navbar.classList.remove('show');
          }

          prevScrollPos = currentScrollPos;
          isScrolling = false;
        });
      }
      isScrolling = true;
    };

    // Show navbar initially
    document.querySelector('.new-navbar').classList.add('show');
    
    // Add scroll event listener to the window
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return <div className="new-navbar">
    <div className="logo" onClick={()=>navigate('/platform-management-feature/portfolio')}>
    Portfolio
    </div>
    <div className="tabs">
        <div className="tab" onClick={() => navigate('/platform-management-feature/portfolio')}>Home</div>
        <div className="tab" onClick={() => navigate('/platform-management-feature/import')}>Add</div>
        <div className="tab" onClick={()=> navigate('/')}>Collab AI</div>
    
    </div>
  </div>;
};

export default NewNavbar;
