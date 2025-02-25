
//some other ways to  execute functions:

// 1. const asyncHandler=()=>{}   normal
// 2. const asyncHandler=(func)=>()=>{}   passing a func
// 3. const asyncHandler=(func)=>async()=>{} making that passing a function async


//for returning in the form of a try-catch block:

// const asyncHandler=(fn)=>async(requestAnimationFrame,resizeBy,err,next)=>{
//     try{

//         await fn(req,res,next)
//     }catch(error){
//         res.status(err.code || 500).json({
//             success:false,
//             message: err.message
//         })
//     }
// }


//for a promise block:

const asyncHandler=(requestHandler)=>{
    return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).catch((err)=>next(err))
    }
}

export {asyncHandler}
