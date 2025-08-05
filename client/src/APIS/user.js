import axios from 'axios';


const server = axios.create({
    baseURL: "http://localhost:3000"
})


export const getSetUser=async(id,name,email)=>{
    try {
        const res=await server.post("/get-set-user",{id,name,email});
        return true;
    } catch (error) {
        return false;
    }
}



