import React from 'react'
import { Test } from '../APIS/test'

const Home = () => {

  return (
    <div>
      you are at home
      <br />
      <button className='p-2 bg-amber-600 ' onClick={async (e) => {await Test() }}> click me</button>
    </div>
  )
}

export default Home
