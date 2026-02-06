"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genrateNewAccessAndRefreshToken = exports.userLogout = exports.userSignup = exports.userLogin = void 0;
const auth_model_1 = require("./auth-model");
const utils_export_1 = require("../../utils/utils-export");
const userSignup = async (req, res) => {
    try {
        //checkpoints
        /*
                access user details like username, email,etc...
                genrate an error if user misktakenly miss any one of the fields
                check if user already register or not if register kindly login
                create a new user
                again check if user registered or not
                */
        const { fullName, password, email } = req.body;
        //check validation if an user is enter a value in field or not
        if (!email?.trim() || !password?.trim() || !fullName?.trim()) {
            throw new utils_export_1.ApiErrorHandling(utils_export_1.HttpCodes.BAD_REQUEST, "All fields are required");
        }
        //check for existing user from DB
        const userExist = await auth_model_1.Auth.findOne({ email });
        if (userExist) {
            throw new utils_export_1.ApiErrorHandling(utils_export_1.HttpCodes.BAD_REQUEST, "User with email or username already exists");
        }
        //create a new user
        const user = await auth_model_1.Auth.create({
            fullName,
            email,
            password,
        });
        const userCreated = await auth_model_1.Auth.findById(user._id).select("-password -refreshToken");
        if (!userCreated) {
            throw new utils_export_1.ApiErrorHandling(utils_export_1.HttpCodes.BAD_REQUEST, "Something went wrong while registering the user");
        }
        return res
            .status(201)
            .json(new utils_export_1.ApiResponse(200, userCreated, "User registered Successfully"));
    }
    catch (error) {
        if (error instanceof utils_export_1.ApiErrorHandling) {
            return res
                .status(error.statusCode)
                .json(new utils_export_1.ApiResponse(error.statusCode, null, error.message));
        }
        return res
            .status(utils_export_1.HttpCodes.INTERNAL_SERVER_ERROR)
            .json(new utils_export_1.ApiResponse(utils_export_1.HttpCodes.INTERNAL_SERVER_ERROR, null, "Internal Server Error error"));
    }
};
exports.userSignup = userSignup;
const userLogin = async (req, res) => {
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
            throw new utils_export_1.ApiErrorHandling(utils_export_1.HttpCodes.BAD_REQUEST, "user credential required");
        }
        //check if user register or not
        const user = await auth_model_1.Auth.findOne({ email });
        if (!user) {
            throw new utils_export_1.ApiErrorHandling(utils_export_1.HttpCodes.BAD_REQUEST, "Invalid user credentials");
        }
        // let userID = await User.findById(email);
        // Compare passwords (assuming password is stored as plain text, but in production use bcrypt to secure more with salt)
        const checkUserPasssowrd = await user.IsPasswordCorrect(password);
        if (!checkUserPasssowrd) {
            throw new utils_export_1.ApiErrorHandling(utils_export_1.HttpCodes.BAD_REQUEST, "Invalid user credentials");
        }
        const { accessToken, refreshToken } = await (0, utils_export_1.getAccessAndRefreshToken)(String(user._id));
        // const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
        //loggedInUser is optionally because we can also extract user details directly from stored jwt tokens
        // If you want to return a token, generate it here
        res
            .status(200)
            .cookie("accessToken", accessToken, {
            // httpOnly: true,
            // secure: true, // required for HTTPS
            // sameSite: "none", // allow cross-site
            path: "/",
            // expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
            maxAge: 84600 * 1000,
        })
            .cookie("refreshToken", refreshToken, {
            // httpOnly: true,
            // secure: true, // required for HTTPS
            // sameSite: "none", // allow cross-site
            // path: "/",
            // expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
            maxAge: 84600 * 1000,
        })
            .json(new utils_export_1.ApiResponse(200, { accessToken, refreshToken }, "user login successful"));
    }
    catch (error) {
        //we can check if error is instance of ApiError
        //we use oops concept to handle the error
        if (error instanceof utils_export_1.ApiErrorHandling) {
            res
                .status(error.statusCode)
                .json(new utils_export_1.ApiResponse(error.statusCode, null, error.message));
        }
        else {
            res
                .status(utils_export_1.HttpCodes.INTERNAL_SERVER_ERROR)
                .json(new utils_export_1.ApiResponse(utils_export_1.HttpCodes.INTERNAL_SERVER_ERROR, null, "Internal Server Error"));
        }
    }
};
exports.userLogin = userLogin;
const userLogout = async (req, res) => {
    await auth_model_1.Auth.findByIdAndUpdate(req.user?._id, {
        $unset: {
            refreshToken: 1, // this removes the field from document
        },
    }, {
        new: true,
    });
    const options = {
        httpOnly: true,
        secure: true,
    };
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new utils_export_1.ApiResponse(200, {}, "User logged Out"));
};
exports.userLogout = userLogout;
//why we generate new both access and refresh token again
//to maintain the security for webapp we generate both access and refresh token,
//why we generate the refresh token again if its limit is 10d because with refresh token anyone can re-generate access token
const genrateNewAccessAndRefreshToken = async (req, res) => {
    //get refresh token from browser local storage
    //check if it valid or not
    //verify the token with jwt
    //check if stored token in DB and browser stored token are same or not
    //now generate new access token and refresh token to maintain the security for web app
    try {
        const localToken = req.cookies.refreshToken;
        if (!localToken) {
            throw new utils_export_1.ApiErrorHandling(utils_export_1.HttpCodes.BAD_REQUEST, "invaild token kindly check");
        }
        const user = (0, utils_export_1.jwtVerifyRefreshToken)(localToken);
        if (!user) {
            throw new utils_export_1.ApiErrorHandling(utils_export_1.HttpCodes.BAD_REQUEST, "invaild decoded token");
        }
        const storedDBToken = await auth_model_1.Auth.findById(user?.UserPayLoad._id);
        if (storedDBToken?.refreshToken !== localToken) {
            throw new utils_export_1.ApiErrorHandling(utils_export_1.HttpCodes.BAD_REQUEST, "something wrong with token");
        }
        const { accessToken, refreshToken } = await (0, utils_export_1.getAccessAndRefreshToken)(user.UserPayLoad._id);
        //why we use this keyword because i am using the constructor to maintain the code readbility so, to access the method define in constructor with this keyword
        const cookieOptions = {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            path: "/",
        };
        return res
            .status(200)
            .cookie("accessToken", accessToken, {
            ...cookieOptions,
            maxAge: 60 * 60 * 24 * 1000,
        })
            .cookie("refreshToken", refreshToken, {
            ...cookieOptions,
            maxAge: 60 * 60 * 24 * 10 * 1000,
        })
            .json(new utils_export_1.ApiResponse(200, { accessToken, refreshToken }, "succesfull refresh tokens"));
    }
    catch (error) {
        if (error instanceof utils_export_1.ApiErrorHandling) {
            return res
                .status(error.statusCode)
                .json(new utils_export_1.ApiResponse(error.statusCode, null, error.message));
        }
        else {
            return res
                .status(utils_export_1.HttpCodes.INTERNAL_SERVER_ERROR)
                .json(new utils_export_1.ApiResponse(utils_export_1.HttpCodes.INTERNAL_SERVER_ERROR, null, "Internal Server Error"));
        }
    }
};
exports.genrateNewAccessAndRefreshToken = genrateNewAccessAndRefreshToken;
//# sourceMappingURL=auth-controllers.js.map