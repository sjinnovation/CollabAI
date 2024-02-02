import { useEffect, useState } from 'react';
import { List } from 'antd';
import { getUserID } from '../../Utility/service';
import { retrieveUserProfile } from '../../api/profile';

const ProfileInfo = () => {
  const userId = getUserID();
  const [userInfo, setUserInfo] = useState({});

  useEffect(()=>{
      retrieveUserProfile(userId).then((user)=>{
      setUserInfo(user);
    });
  },[userId])

  const { fname, lname, email, role } = userInfo;
  const fullName = `${fname} ${lname}`;

  const data = [
    { title: 'Full Name', description: fullName },
    { title: 'Email', description: email },
    { title: 'Role', description: role },
  ];

  return (
      <>
        <List
          header={<div>Your account details</div>}
          size="small"
          bordered
          dataSource={data}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                title={item.title}
                description={item.description}
              />
            </List.Item>
          )}
        />
      </>
  );
};

export default ProfileInfo;