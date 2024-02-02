// save user data to local storage
export const saveUserToLocalStorage = (user) => {
    localStorage.userID = user?.userid;
    localStorage.userToken = user?.token;
    localStorage.userEmail = user?.user_email;
    localStorage.compId = user?.compId;
    localStorage.role = user?.role;
    localStorage.userName = user?.userName;
    localStorage.userTeamAccess = user?.hasAccess;
};