import React, { useEffect, useState } from 'react';
import { axiosOpen ,axiosSecure,axiosSecureInstance} from '../../api/axios';

const MeetingTypeDropdown = () => {
  const [selectedValue, setSelectedValue] = useState('');
  const [meetingTypes, setMeetingTypes] = useState([]);

  const handleSelectChange = (event) => {
    setSelectedValue(event.target.value);
  };


  useEffect(() => {
    const fetchMeetingTypes = async () => {
      try {
console.log("inside meeting type dropdown");

        const response = await axiosSecureInstance.get(`/api/meetingTypes/getAllMeetingTypes`);

        // console.log("meeting types response:", response);
        const result = (response.data.meetingTypes);
        console.log(result);
        const count = (response.data.pages);
        console.log(count);

        
        
        setMeetingTypes(result);
        
      } catch (error) {
        console.log(error);
      }
    };
    fetchMeetingTypes();
  }, []);

  return (
    <div>
      
      <select onChange={handleSelectChange} value={selectedValue}>
        <option value="">Meeting Types</option>
        {
          meetingTypes?.map(meet=> <option key={meet._id} value="option1">{meet.title}</option>)
        }
        
        
      </select>
      
    </div>
  );
};

export default MeetingTypeDropdown;