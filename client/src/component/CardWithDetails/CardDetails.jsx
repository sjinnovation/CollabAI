import React from 'react';
import "./style.css";
import Cards from '../common/popUpCard';
const CardDetails = ({ title,description,  model, instructions, assistantId, usersId, assistantType,createdBy, onClick }) => {


    return (
        <div className="card" onClick={onClick} >
            <Cards title={title} description={description} model={model} id={assistantId} assistantType={assistantType} usersId={usersId} createdBy={createdBy} width={"22rem"} height={"100%"} color={"gray"} onClick/>
        </div>
    );
}

export default CardDetails;
