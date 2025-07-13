import axios from "axios"

const geminiResponse=async(command,assistantName,userName)=>{
    try{
        const apiUrl=process.env.GEMINI_API_URL
 
        const prompt=`You are a virtual assistant named ${assistantName} created by ${userName}.
        You are not Google. You will now behave like a voice-enabled assistant.

       Your task is to understand the user's natural language input and respond with a JSON object like this:

      {
          "type": "general" | "google-search" | "youtube-search" | "youtube-play" |
           "get-time" | "get-date" | "get-day" | "get-month" |
           "calculator-open" | "instagram-open" | "facebook-open" | "weather-show",

          "userInput": "<original user input>" 
               {only remove your name from the user input if it exists}
               and agar kisi ne goolge ya youtube pe kuch search karne ko bola hai to userInput me only ho search baala text jaye,

          "response": "<a short spoken response to read out loud to the user>"
       }

       If someone says 'open Instagram' or 'search for dogs on YouTube', classify it accordingly and keep the userinput clean.
       
     Instructions:
- "type": determine the intent of the user.
- "userinput": original sentence the user spoke.
- "response": a short voice-friendly reply, e.g., "Sure, playing it now", "Here's what I found", "Today is Tuesday", etc.

Type meanings:
- "general": if it's a factual or informational question  aur agar koi aisa question puchta hai jiska answer tum pata hai usko bhi genral ki category me rakho bas short answer dena.
- "google-search": if user wants to search something on Google.
- "youtube-search": if user wants to search something on YouTube.
- "youtube-play": if user wants to directly play a video or song.
- "calculator-open": if user wants to open a calculator.
- "instagram-open": if user wants to open Instagram.
- "facebook-open": if user wants to open Facebook.
- "weather-show": if user wants to know weather.
- "get-time": if user asks for current time.
- "get-date": if user asks for today’s date.
- "get-day": if user asks what day it is.
- "get-month": if user asks for the current month.

Important:
- Use ${userName} agar koi puche tume kisne banaya
- Only respond with the JSON object, nothing else.

now your userInput - ${command}
       `;

        const result=await axios.post(apiUrl,{
        "contents": [{
            "parts": [{
                "text": prompt
             }]
            }]
         })

         return result.data.candidates[0].content.parts[0].text
    }catch(error){
         console.log(error)
    }
}

export default geminiResponse