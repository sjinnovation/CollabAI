import React, { useState } from 'react';
import profilePic from '../../assests/images/flower.jpg';
import { Card, Avatar } from 'antd';


const Cards = ({ title, id, assistantType, createdBy, width, height, color, onClick }) => {
    const { Meta } = Card;
    return (

        <Card style={{ width: width, marginTop: 16, color: color, height: height }} hoverable>
            <Meta

                avatar={<Avatar src={profilePic} />}
                title={title}
                description={assistantType}
            />
            <div style={{ textAlign :"left" ,paddingLeft: "10.5%"}}>
                <p>CreatedBy : {createdBy}</p>
            </div>
        </Card>
    );
}

export default Cards;
