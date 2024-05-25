module.exports = {

    adminAuth:(req,res,next)=>{
     
     if(req.session.admin){
     
         next()
     }else{
  
        res.render("/");
     }
    },
 
    userAuth:(req,res,next)=>{

     if(req.session.user){
         next()
     }else{
         res.render('/login')
     }
    },
 
 }