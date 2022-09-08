const server = require('../model/server')
const User = require('../model/User');

const joinServer = async (req, res) => {
    const { code, email } = req.body;
    console.log('entered join server')

    try{
        //server that needs to be joined
        const servers = await server.findOne({'_id': code }).exec();
        //detail of the user that needs to be added in the server document
        const user = await User.findOne({'email': email}).exec();

        console.log("servers " + servers)
        console.log("user id " + user.id)

        const userArray = servers.user
        userArray.push(user._id)

        let newValue = { $set: {user: userArray}};

        await servers.updateOne(servers, newValue, () => {
            console.log('updated')
        })
        res.status(201).json({ servers })
    } catch( err ){
        console.log(err)
    }
}

module.exports = { joinServer }