import ratelimit from "../config/upstash.js";

const rateLimiter = async(req,res,next) => {
    try{
        //here we kept it a simple 
        // in future we put here the userId and ipAddress as your key
        const {success} = await ratelimit.limit("my-rate-limiter");

        if(!success) {
            return res.status(429).json({
                message:"Too many requests, please try again later."
            });
        }

        next();
    }catch(error){
      console.log("Rate limit error",error);
      next(error);
    }
 };

export default rateLimiter;