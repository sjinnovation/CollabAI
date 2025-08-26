import { useState, createContext } from "react";

export const ProfileContext = createContext({
  userAvatar: "",       
  setUserAvatar: () => {}  
});

function ProfileProvider(props) {
  const [userAvatar, setUserAvatar] = useState("");

  const contextData = {
    userAvatar, setUserAvatar
  };

  return (
    <ProfileContext.Provider value={contextData}>
      {props.children}
    </ProfileContext.Provider>
  );
}

export default ProfileProvider;