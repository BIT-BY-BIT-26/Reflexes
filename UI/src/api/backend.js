import axios from "axios";
const API=" http://localhost:3000"

export const signup = (email,password)=>{
    return axios.post(`${API}/signup`);
}