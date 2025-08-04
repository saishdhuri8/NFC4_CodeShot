import React, { useContext } from 'react'
import { Test } from '../APIS/test'
import UserContext from '../context/UserContext'

const Home = () => {

  const { user } = useContext(UserContext);
  

  return (
    <div>
      you are at home
      <br />
      <button className='p-2 bg-amber-600 ' onClick={async (e) => { await Test() }}> click me</button>

      

    </div>
  )
}

export default Home
