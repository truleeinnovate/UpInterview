import React from 'react'

const newcustomenv = () => {

    console.log('new env for testing', process.env.REACT_APP_TEST);
  return (
    <div>newcustomenv</div>
  )
}

export default newcustomenv