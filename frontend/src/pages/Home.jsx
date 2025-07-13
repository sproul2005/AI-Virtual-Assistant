 import React, { use, useRef, useState } from 'react'
import axios from 'axios';
import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { userDataContext } from '../context/UserContext'
import { useEffect } from 'react'
import aiImg from "../assets/ai.gif"
import userImg from "../assets/user.gif"
import { CgMenu } from "react-icons/cg";
import { RxCross2 } from "react-icons/rx";


const Home = () => {
  const navigate = useNavigate()
  const { userData,serverUrl,setUserData ,getGeminiResponse} = useContext(userDataContext)
  const [listening,setListening]=useState(false)
  const [userText,setUserText]=useState("")
  const [aiText,setAiText]=useState("")
  const isSpeakingRef=useRef(false)
 const isRecognizingRef = useRef(false);
  const recognitionRef=useRef(null)
  const [ham,setHam]=useState(false)
  const synth= window.speechSynthesis

  const handleLogout=async()=>{
    try{
      const result=await axios.get(`${serverUrl}/api/auth/logout`,
        {withCredentials:true})
        setUserData(null)
        navigate("/signin")
    } catch(error){
      setUserData(null)
      console.log(error)
    }
  }

  const startRecognition=()=>{
    try{
        recognitionRef.current?.start();
        setListening(true);
    } catch(error){
      if(!error.message.includes("start")){
        console.log("Recognition error:",error);
      }
    }
  };

   const speak = (text) => {
   const utterance = new SpeechSynthesisUtterance(text);
   utterance.lang='hi-IN';
   const voices=window.speechSynthesis.getVoices()
   const hindiVoice=voices.find(v => v.lang === 'hi-IN');
   if(hindiVoice){
    utterance.voice=hindiVoice;
   }

   isSpeakingRef.current=true
   utterance.onend=()=>{
    setAiText("")
    isSpeakingRef.current=false
    startRecognition()
   }
    synth.speak(utterance);
   }
  
   const handlerCommand=(data)=>{
    const {type,userInput,response}=data
    speak(response);

   if(type === 'google-search'){
      const query=encodeURIComponent(userInput);
      window.open(`https://www.google.com/search?q=${query}`,
        '_blank');
    }

    if(type === 'calculator-open'){
      window.open(`https://www.google.com/search?q=calculator`,'_blank');
    }

    if(type === "instagram-open"){
      window.open(`https://www.instagram.com/`,'_blank');
    }
    if(type === "facebook-open"){
      window.open(`https://www.facebook.com/`, '_blank');
    }
    if(type === "weather-show"){
      window.open(`https://www.google.com/search?q=weather`, '_blank');
    }
      if(type === 'youtube-search' || type === 'youtube-play'){
      const query=encodeURIComponent(userInput);
      window.open(`https://www.youtube.com/results?search_query=${query}`,
        '_blank');
    }
   }

  useEffect(()=>{
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    const recognition=new SpeechRecognition()
    recognition.continuous=true,
    recognition.lang='en-US'

    recognitionRef.current=recognition
    //const isRecognizingRef={current:false}
   

    const safeRecognition=()=>{
      
      if(!isSpeakingRef.current && !isRecognizingRef.current){
        try{
              recognition.start();
              console.log("Recognition requested to start");
        } catch(err){
          if(err.name !== "InvalidStateError"){
            console.log("Start error:", err)
          }
        }
      }
    };
  

    recognition.onstart=()=>{
      // console.log("Recognition started");
      isRecognizingRef.current=true;
      setListening(true)
    };
    recognition.onend=()=>{
      // console.log("Recognition ended");
      isRecognizingRef.current=false;
      setListening(false);

      if(!isSpeakingRef.current){
        setTimeout(()=>{
          safeRecognition()
        },1500);
      }
    };


    recognition.onerror=(event)=>{
      console.warn("Recognition error:", event.error);
      isRecognizingRef.current=false;
      setListening(false);
      if(event.error !== "aborted" && !isSpeakingRef.current){
        setTimeout(()=>{
          safeRecognition();
        },1000);
      }
    }

    recognition.onresult= async (e)=>{
       const transcript=e.results[e.results.length -1][0].transcript.trim();
 
       if(transcript.toLowerCase().includes(userData.assistantName.toLowerCase())){
        setAiText("")
        setUserText(transcript)
        // recognition.stop()
        isRecognizingRef.current=false
        setListening(false)
        const data= await getGeminiResponse(transcript)
        handlerCommand(data)
        setAiText(data.response)
        setUserText("")
       }
    };


    const fallback=setInterval(()=>{
      if(!isSpeakingRef.current && !isRecognizingRef.current){
        safeRecognition()
      }
    },2000);
    safeRecognition()
    return ()=>{
      recognition.stop()
      setListening(false)
      isRecognizingRef.current=false
      clearInterval(fallback)
    };
    
  },[]);



 return (
    <div className="relative flex flex-col items-center justify-center h-screen bg-gradient-to-t from-black to-[#02023d] text-white p-8 overflow-hidden">

      {/* Top-right buttons for Desktop */}
      <div className="hidden lg:flex absolute top-5 right-5 flex-col items-end gap-3 z-10">
        <button className="w-[160px] h-[45px] text-black font-semibold bg-white rounded-full text-[18px]" onClick={handleLogout}>
          Logout
        </button>
        <button className="w-[160px] px-4 py-2 bg-cyan-500 font-semibold rounded-full text-white text-sm hover:bg-cyan-600 transition" onClick={() => navigate('/customize')}>
          Customize Assistant
        </button>
        <button className="w-[160px] px-4 py-2 bg-purple-500 font-semibold rounded-full text-white text-sm hover:bg-purple-600 transition" onClick={() => navigate('/customize2')}>
          Advanced Customization
        </button>
      </div>

      {/* Menu icon for Mobile */}
      <div className="lg:hidden absolute top-5 right-5 z-20">
        <CgMenu className="text-white w-[30px] h-[30px] cursor-pointer" onClick={() => setHam(true)} />
      </div>

      {/* Mobile Side Menu */}
      {ham && (
        <div className="fixed inset-0 bg-[#00000080] backdrop-blur-sm flex flex-col items-start p-6 gap-5 z-30 transition-all">
          <RxCross2 className="text-white w-[30px] h-[30px] absolute top-5 right-5 cursor-pointer" onClick={() => setHam(false)} />

          <button className="w-[160px] h-[45px] text-black font-semibold bg-white rounded-full text-[18px]" onClick={handleLogout}>
            Logout
          </button>
          <button className="w-[160px] px-4 py-2 bg-cyan-500 font-semibold rounded-full text-white text-sm hover:bg-cyan-600 transition" onClick={() => { setHam(false); navigate('/customize') }}>
            Customize Assistant
          </button>
          <button className="w-[160px] px-4 py-2 bg-purple-500 font-semibold rounded-full text-white text-sm hover:bg-purple-600 transition" onClick={() => { setHam(false); navigate('/customize2') }}>
            Advanced Customization
          </button>

          <div className="w-full h-[2px] bg-gray-400"></div>
          <h1 className="text-white font-semibold text-[19px]">History</h1>
          <div className="w-full h-[300px] overflow-y-auto flex flex-col gap-2 truncate">
            {userData.history?.map((his) => (
              <div className="text-gray-400 text-[16px] w-full h-[30px]">{his}</div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <h1 className="text-4xl font-bold mb-3 text-center">
        👋Welcome to Your Assistant Dashboard
      </h1>
      <p className="mb-4 text-center font-semibold">🤖 Your AI Assistant is Ready 🚀</p>

      <div className="w-[300px] h-[400px] flex justify-center items-center overflow-hidden rounded-4xl shadow-lg mb-3">
        <img src={userData?.assistantImage} alt="" className="h-full object-cover" />
      </div>

      <h1 className="text-white text-[18px] font-semibold mb-4 p-[5px]">
        I'm <span>{userData?.assistantName}</span>
      </h1>

      {!aiText && <img src={userImg} alt='' className='w-[200px]' />}
      {aiText && <img src={aiImg} alt='' className='w-[200px]' />}
      <h1 className="text-white text-[16px] font-semibold text-wrap text-center px-4">
        {userText || aiText || ""}
      </h1>
    </div>
  );
};

export default Home;