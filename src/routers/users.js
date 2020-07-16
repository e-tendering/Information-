const express=require('express');
const User=require('../models/user');
const auth=require('../middleware/auth');

const router=new express.Router();

//user create route
router.post('/users',async(req,res)=>{
    const user=new User(req.body)
    try{
        await user.save();
        const token=user.authToken();
        res.status(201).send({user,token});
    }catch(e){
        res.status(400).send(e);
    }
})

//user login route

router.post('/users/login',async(req,res)=>{
    try{
        const user = await User.findByCredentials(req.body.email,req.body.password);
        const token= await user.authToken();
        res.send({user,token});
    }
    catch(e){
        res.status(400).send()
    }
})


//user logout route
router.post('/users/logout',auth,async(req,res)=>{
    try{
        //console.log("first",req.token);
        //console.log("second",req.user.tokens);
        req.user.tokens=req.user.tokens.filter((ele)=>{
                return ele.token!==req.token
        })
        //console.log(req.user.tokens);
         await req.user.save();
        res.send();
    }catch(e){
        res.status(500).send();
    }
})


//checking user profile via auth middleware and back user with the token id
router.get('/users/me',auth,async(req,res)=>{
    res.send(req.user);
})

//update user services
router.patch('/users/me',auth,async(req,res)=>{
    // console.log(req.body);
    // console.log(req.user);
    const updates=Object.keys(req.body);
   // console.log(updates);
    const allowedUpdates=['name','email','password','age','CompanyName','RegistrationNumber','RegistrationAddress','city','State','postalcode','PAN_Number'];
    const isValidOperations=updates.every(update=>allowedUpdates.includes(update))
    if(!isValidOperations){
        return res.status(500).send({error:'Invalid Updates'});
    }
    //console.log(updates);
    try{
        // const _userid=req.params.id
        // const user=await User.findById(_userid);
        //console.log("update user",user);
        updates.forEach(update=>req.user[update]=req.body[update]);
        await req.user.save()

        //const user=await User.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});
        // if(!user){
        //     return res.status(404).send();
        // }
        res.send(req.user);
    }
    catch(e){
        res.status(500).send();
    }
})

//delete user services
router.delete('/users/me',auth,async(req,res)=>{
    try{
        await req.user.remove();
        res.send(req.user);
    }catch(e){
        res.status(500).send();
    }

})

module.exports=router;
