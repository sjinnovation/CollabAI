import React from 'react';
import profilePic from '../../assests/images/flower.jpg';
import "./style.css";
import Cards from '../common/Card';

const CardinList = ({ title, id, assistantType, createdBy, onClick }) => {


    return (

        <div>
                        <Cards title={title} id={id} assistantType={assistantType} createdBy={createdBy} width={300} height={100} color={"gray"} onClick/>

        </div>

    );
}

export default CardinList;
