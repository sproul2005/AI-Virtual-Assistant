import React, { createContext, useEffect, useState } from 'react'
import axios from "axios"
import { comma } from 'postcss/lib/list'
export const userDataContext=createContext()
function UserContext({children}){
  const serverUrl="http://localhost:8000"
  const [userData,setUserData]=useState(null)
  const [frontendImage,setFrontendImage]=useState(null)
  const [backendImage,setBackendImage]=useState(null)
  const [selectedImage,setSelectedImage]=useState(null)
  const [loading,setLoading]=useState(true)

  const handleCurrentUser=async()=>{
    try{
      const result= await axios.get(`${serverUrl}/api/user/current`,{withCredentials:true})
      setUserData(result.data)
      setLoading(false)
      console.log(result.data)
    } catch(error){
      console.log(error)
      setLoading(false)
    }
  }


  const getGeminiResponse=async(command)=>{
    try{
        const result =await axios.post(`${serverUrl}/api/user/asktoassistant`,{command},{withCredentials:true})
        return result.data
    }catch(error){
       console.log(error)
    }
  }



  useEffect(()=>{
    handleCurrentUser()
  },[])

  const value={
    serverUrl, userData,setUserData,backendImage,setBackendImage,frontendImage,setFrontendImage,selectedImage,setSelectedImage,getGeminiResponse
  }
  return (
    <userDataContext.Provider value ={value}>
      {children}
    </userDataContext.Provider>
  )
}

export default UserContext
