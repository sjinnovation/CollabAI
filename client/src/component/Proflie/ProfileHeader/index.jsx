import { useContext } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../../../contexts/themeConfig";
import "./ProfileHeader.css";

const ProfileHeader = ({ title, subHeading, breadcrumbs }) => {
  const { theme } = useContext(ThemeContext);

  return (
    <div className="header-section">
      <h2 className="component-title">{title}</h2>
      <p className="component-subtitle">{subHeading}</p>

      {breadcrumbs && breadcrumbs?.length > 0 && (
        <p className="breadcrumbs">
          {breadcrumbs?.map((crumb, idx) => (
            <span key={idx}>
              {idx < breadcrumbs?.length - 1 ? (
                <>
                  <Link to={crumb.url} className={`breadcrumb-link ${theme}`}>
                    {crumb.label}
                  </Link>
                  <span> &gt; </span>
                </>
              ) : (
                <span>{crumb.label}</span>
              )}
            </span>
          ))}
        </p>
      )}
    </div>
  );
};

export default ProfileHeader;
