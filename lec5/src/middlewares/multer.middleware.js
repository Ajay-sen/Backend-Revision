import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/temp')
    },
    filename: function (req, file, cb) { //you can customize the names of those files being uploaed as you want
      
      cb(null, file.originalname)
    }
  })
  
  export const upload = multer({ 
    storage ,
}) 