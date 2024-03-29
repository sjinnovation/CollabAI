
const getUserID = () => {
    return (localStorage.getItem("userID"));
  };
  
  const getUserEmail = () => {
    return (localStorage.getItem("userEmail"));
  }
  
  const getUserRole = () => {
    return (localStorage.getItem("role"));
  }
  
  const getUserToken = () => {
    return (localStorage.getItem("userToken"));
  };
  
  const isLoggedIn = () => {
    return localStorage.getItem("userID") || false;
  }
  const logout = () => {
    localStorage.clear();
  };
  
  const getUserTeamID = () => {
    return (localStorage.getItem("userTeamId"));
  };
  
  const getUserTeamAccessStatus = () => {
    const checkAccess = localStorage.getItem("userTeamAccess");
    console.log("🚀 ~ getUserTeamAccessStatus ~ checkAccess:", checkAccess)
    return (checkAccess === "true") ? true : false;
  }

  const getCompId = () => {
    return (localStorage.getItem("compId"));
  }

  const logoutUserAndRedirect = () => {
    localStorage.clear();
    setTimeout(() => {
      window.location.href = "/login";
    }, 700);
  };
  
  export { getUserID, getUserEmail, getUserToken, getUserRole, isLoggedIn, logout, getUserTeamID, getUserTeamAccessStatus, getCompId, logoutUserAndRedirect };
  