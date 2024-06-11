import React, { useState } from 'react';
import profilePic from '../../assests/images/flower.jpg';
import "./index.css";
import Cards from '../common/Card';

const Card = ({ title, id, assistantType, createdBy, onClick }) => {
    return (
        <div>
            <Cards title={title} id={id} assistantType={assistantType} createdBy={createdBy} width={300} height={150} color={"gray"} onClick />

        </div>

    );
}

export default Card;
