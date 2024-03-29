import { useNavigate } from "react-router-dom";
import logo from '../../../assests/images/NewLogo.png'

const Header = () => {
  const navigate = useNavigate();

  return (
    <>
      <nav
        className="navbar navbar-expand navbar-dark bg-dark sticky-top pt-3"
        aria-label="Second navbar example"
      >
        <div className="container-fluid CustomFlex">

          <div className="d-flex w-100">
            <img
              onClick={() => {
                navigate("/chat", { replace: true });
              }}
              alt="brand logo"
              src={logo}
              width="250"
              height="auto"
              className="mx-auto"
            />
          </div>
        </div>
      </nav>
    </>
  );
};

export default Header;
