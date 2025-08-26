import React from 'react';

const FormLink = ({ label, onClick, className }) => (
    <a 
        href="#" 
        onClick={e => {
            e.preventDefault(); 
            onClick();
        }}
        // className="" 
        
    >
       <u style={{fontSize:'13px'}}>{label}</u>
    </a>
);

export default FormLink;
