import { Rate } from 'antd'
import React from 'react'

const Rating = ({value, allowHalf, handleRating}) => {
  return (
    <Rate style={{color: '#ffa534'}} value={value} allowHalf={allowHalf} onChange={handleRating} />
  )
}

export default Rating