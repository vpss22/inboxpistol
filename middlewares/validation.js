// middleware to validate schemas

const validate=(schema)=>async(req,res,next)=>{
    try{
        await schema.validate({
            body: req?.body,
            params: req?.params,
            query: req?.query
        });
        return next();
    }catch(err){
        return res.status(500).json({status:500, message: err.message , type: err.name})
    }
}

module.exports = validate
