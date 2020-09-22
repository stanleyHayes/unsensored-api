const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.auth = async (req, res, next) => {

    try {
        if(!req.headers.authorization){
            return res.status(401).json({error: 'Authorization failed'});
        }

        const token = req.headers.authorization.split(" ")[1];
        if(!token){
            return res.status(401).json({error: 'Authorization failed'});
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({_id: decoded._id, "tokens.token": token});
        if(!user){
            return res.status(401).json({error: 'Authorization failed'});
        }
        req.user = user;
        req.token = token;
        next();
    }catch (e){
        res.status(500).json({error: e.message});
    }




}