import { User } from '../models/user.model.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { ApiError } from '../utils/ApiError.js'
import jwt from 'jsonwebtoken'

class authControllers {
    // constructor() { }

    getAccessAndRefreshToken = async (userId) => {
        try {
            const user = await User.findById(userId)
            // console.log(user)
            const accessToken = user.genrateAccessToken();
            const refreshToken = user.genrateRefreshToken()

            user.refreshToken = refreshToken;
            await user.save()

            return { accessToken, refreshToken }
        }
        catch (error) {
            throw new ApiError(404, "something went wrong", error)
        }
    }

    userSignup = async (req, res) => {
        try {
            //checkpoints 
            /* 
            access user details like username, email,etc...
            genrate an error if user misktakenly miss any one of the fields
            check if user already register or not if register kindly login
            create a new user
            again check if user registered or not 
            */
            const { fullName, userName, password, email } = req.body
            // console.log(`email : ${email} && password : ${password} `)

            //check validation if an user is enter a value in field or not
            const data = [email, password, userName, fullName];
            const dataValidation = data.some((currEle) => currEle?.trim() === "");
            if (dataValidation) {
                throw new ApiError(400, "All fields are required")
            }

            //check for existing user from DB
            const userExist = await User.findOne({ email, userName })
            if (userExist) {
                throw new ApiError(409, "User with email or username already exists")
            }

            //create a new user
            const user = await User.create({
                fullName,
                userName: userName.toLowerCase(),
                email,
                password
            })

            const userCreated = await User.findById(user._id).select(
                "-password -refreshToken"
            )
            if (!userCreated) {
                throw new ApiError(500, "Something went wrong while registering the user")
            }

            res.status(201).json(
                new ApiResponse(200, userCreated, "User registered Successfully")
            )
        } catch (error) {
            throw new ApiError(400, "server not responding")
        }

    }

    userLogin = async (req, res) => {

        try {
            /*
       access login credential from user like email and password
       check if user register or not
       check the details with db
       return the token
       */

            //access login credential
            const { email, password } = req.body;

            if (!email || !password) {
                throw new ApiError(400, "user credential required")
            }

            //check if user register or not
            const user = await User.findOne({ email });
            if (!user) {
                throw new ApiError(401, "Invalid user credentials")
            }
            // console.log(user._id)
            // let userID = await User.findById(email);
            // Compare passwords (assuming password is stored as plain text, but in production use bcrypt to secure more with salt)
            const checkUserPasssowrd = await user.isPasswordCorrect(password);
            if (!checkUserPasssowrd) {
                throw new ApiError(401, "Invalid user credentials")
            }

            const { accessToken, refreshToken } = await this.getAccessAndRefreshToken(user._id)
            // const loggedInUser = await User.findById(user._id).select("-password -refreshToken") 
            //loggedInUser is optionally because we can also extract user details directly from stored jwt tokens
            // console.log(accessToken, refreshToken)

            // If you want to return a token, generate it here

            return res
                .status(200)
                .cookie("accessToken", accessToken, {
                    // httpOnly: true,
                    // secure: true, // required for HTTPS
                    // sameSite: "none", // allow cross-site
                    path: "/",
                    // expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
                    maxAge: 84600 * 1000
                })
                .cookie("refreshToken", refreshToken, {
                    // httpOnly: true,
                    // secure: true, // required for HTTPS
                    // sameSite: "none", // allow cross-site
                    // path: "/",
                    // expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
                    maxAge: 84600 * 1000
                })
                .json(new ApiResponse(200, { accessToken, refreshToken }, "user login successful"));

        } catch (error) {
            //we can check if error is instance of ApiError
            //we use oops concept to handle the error
            if (error instanceof ApiError) {
                return res.status(error.statusCode).json(
                    //send to the client
                    new ApiResponse(error.statusCode, null, error.message)
                );
            }
            else {
                // For Internal errors
                return res.status(500).json(
                    new ApiResponse(500, null, "Internal Server Error")
                );
            }

        }

    }

    userLogout = async (req, res) => {
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $unset: {
                    refreshToken: 1 // this removes the field from document
                }
            },
            {
                new: true
            }
        )

        const options = {
            httpOnly: true,
            secure: true
        }

        return res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(new ApiResponse(200, {}, "User logged Out"))
    }

    //why we generate new both access and refresh token again
    //to maintain the security for webapp we generate both access and refresh token, 
    //why we generate the refresh token again if its limit is 10d because with refresh token anyone can re-generate access token 
    genrateNewAccessAndRefreshToken = async (req, res) => {
        //get refresh token from browser local storage
        //check if it valid or not
        //verify the token with jwt
        //check if stored token in DB and browser stored token are same or not 
        //now generate new access token and refresh token to maintain the security for web app
        try {
            const localToken = req.cookies.refreshToken;
            if (!localToken) {
                throw new ApiError(401, "invaild token kindly check")
            }

            const user = jwt.verify(localToken, process.env.REFRESH_TOKEN_SECRET);
            if (!user) {
                throw new ApiError(401, "invaild decoded token")
            }

            const storedDBToken = await User.findById(user?._id)
            // console.log(storedDBToken.refreshToken)

            if (storedDBToken.refreshToken !== localToken) {
                throw new ApiError(401, "something wrong with token")
            }

            const { accessToken, refreshToken } = await this.getAccessAndRefreshToken(user._id)
            //why we use this keyword because i am using the constructor to maintain the code readbility so, to access the method define in constructor with this keyword

            const cookieOptions = {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                path: "/",
            };

            res
                .status(200)
                .cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 60 * 60 * 24 * 1000 })
                .cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: 60 * 60 * 24 * 10 * 1000 })
                .json(
                    new ApiResponse(200, { accessToken, refreshToken }, "succesfull refresh tokens")
                )
        } catch (error) {
            throw new ApiError(401, "something went wrong")
        }
    }
}

export { authControllers }
