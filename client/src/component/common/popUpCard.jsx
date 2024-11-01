import React, { useState } from 'react';
import profilePic from '../../assests/images/flower.jpg';
import { Card, Avatar,Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { addFavoriteAssistant } from '../../api/favoriteAssistant';

const Cards = ({ title,description,model, id, assistantType,usersId, createdBy, width, height, color, onClick }) => {
    const { Meta } = Card;
    const navigate = useNavigate();

    const openAssistantNewPage = (id, title) => {
        navigate(`/agents/${id}`);
    };
    return (

        <Card style={{ width: width, marginTop: 16, color: color, height: height }}  hoverable>
            <img className="card-image" src={profilePic} alt="profile picture" ></img>

            <Meta
                title={title}
            />
            <div style={{ textAlign :"left" ,paddingLeft: "10.5%"}}>
                <p>{description}</p>
                <p>Model : {model}</p>
             <p className='card-text'>Created by: {createdBy}</p>
             <p className='card-text'>Category: {assistantType}</p>
            </div>
            
            <Button id="buttonChat" onClick={() => openAssistantNewPage(id, title)}>Chat Now</Button>
            <Button id="buttonAdd" onClick={() => addFavoriteAssistant(id, usersId)}>Add to Favorite</Button>
        </Card>
    );
}

export default Cards;
