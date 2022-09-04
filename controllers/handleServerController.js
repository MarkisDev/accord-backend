const Server = require('../model/server')
const User = require('../model/User');

const handleAddServer = async (req,res) => {
    const { roomName, email, id } = req.body;
    
    if(!roomName) return res.status(400).json({ 'message': 'server name is required'})
    
    const user = await User.findOne({'email': email}).exec();
    
    try{
        const result = await Server.create({
            "server_name": roomName,
            "user": [user.id],
            "id": id
        });
        res.status(201).json({
            result,
            message: 'successfully created'
        });
    }  catch (err){
        res.status(500).json({'message': err.message })
    }
}

const handleGetServer = async (req,res) => {
    try{ 
        const user = await User.findOne({ 'email': req.query.email}).exec();
        const dbserver = await Server.find({user: user.id}, {"_id": 0, "user": 0, "__v": 0}).exec();
        res.setHeader('Content-Type', 'application/json')
        res.status(200).json({dbserver})
    } catch(err){
        res.status(500).json({'message': err.message})
    }
}

module.exports = { handleAddServer, handleGetServer }