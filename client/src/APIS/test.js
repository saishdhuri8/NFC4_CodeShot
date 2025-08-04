import axios from 'axios';


const server = axios.create({
    baseURL: "http://localhost:3000"
})

export const Test=async()=>{
    try {
        const res=await server.get("/",{message:"I love you"});
    } catch (error) {
        console.log(error);
    }
}



