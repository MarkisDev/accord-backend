// const User = require('../model/User');
// const jwt = require('jsonwebtoken');

// const handleRefreshToken = async (req, res) => {
//     const cookies = req.cookies;
//     if (!cookies?.jwt) return res.sendStatus(401);
//     const refreshToken = cookies.jwt;

//     const foundUser = await User.findOne({ refreshToken }).exec();
//     if (!foundUser) return res.sendStatus(403); //Forbidden 
//     // evaluate jwt 
//     jwt.verify(
//         refreshToken,
//         process.env.REFRESH_TOKEN_SECRET,
//         async (err, decoded) => {
//             if (err) {
//                 // expired refresh token
//                 foundUser.refreshToken = [...newRefreshTokenArray];
//                 const result = await foundUser.save();
//             }
//             if (err || foundUser.username !== decoded.username) return res.sendStatus(403);
//             const email = foundUser.email
//             const accessToken = jwt.sign(
//                 {
//                     "UserInfo": {
//                         "username": decoded.username,
//                         email 
//                     }
//                 },
//                 process.env.ACCESS_TOKEN_SECRET,
//                 { expiresIn: '10s' }
//             );
            
//             const newRefreshToken = jwt.sign(
//                 { "username": foundUser.username },
//                 process.env.REFRESH_TOKEN_SECRET,
//                 { expiresIn: '15s' }
//             );
//             // Saving refreshToken with current user
//             foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
//             const result = await foundUser.save();

//             // Creates Secure Cookie with refresh token
//             res.cookie('jwt', newRefreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });
//             const user = foundUser.username
//             res.json({ email, user, accessToken })
//         }
//     );
// }

// module.exports = { handleRefreshToken }

const User = require('../model/user');
const jwt = require('jsonwebtoken');

const handleRefreshToken = async (req, res) => {
    const cookies = req.cookies;

    if (!cookies?.jwt) return res.sendStatus(401);  
    const refreshToken = cookies.jwt;
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
    
    const foundUser = await User.findOne({ refreshToken }).exec();

    // Detected refresh token reuse!
    if (!foundUser) {
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            async (err, decoded) => {
                if (err) return res.sendStatus(403); //Forbidden
                // Delete refresh tokens of hacked user
                const hackedUser = await User.findOne({ username: decoded.username }).exec();
                hackedUser.refreshToken = [];
                const result = await hackedUser.save();
            }
        )
        console.log('refreshTokenController: forbidden')
        return res.sendStatus(403); //Forbidden
    }

    const newRefreshTokenArray = foundUser.refreshToken.filter(rt => rt !== refreshToken);
    const email = foundUser.email
    const user = foundUser.username
    const userId = foundUser._id

    // evaluate jwt 
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
            if (err) {
                // expired refresh token
                foundUser.refreshToken = [...newRefreshTokenArray];
                const result = await foundUser.save();
            }
            if (err || foundUser.username !== decoded.username) return res.sendStatus(403);

            // Refresh token was still valid
            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "username": decoded.username,
                        email
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '1h' }
            );
 
            const newRefreshToken = jwt.sign(
                { "username": foundUser.username },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: '1d' }
            );
            // Saving refreshToken with current user
            foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
            const result = await foundUser.save();

            console.log('result: ', result)

            // Creates Secure Cookie with refresh token
            res.cookie('jwt', newRefreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });

            res.json({ email, user, accessToken, userId })
        }
    );
}

module.exports = { handleRefreshToken }
