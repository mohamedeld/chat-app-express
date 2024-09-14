const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../Model/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync.js");

exports.signUp = async (request, response, next) => {
  try {
    const user = await User.create({
      name: request.body.name,
      email: request.body.email,
      password: request.body.password,
    });
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: process.env.EXPIRES_TIME,
      }
    );
    

    response.status(201).json({
      status:"success",
      data: {
        user,
        token
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.loginUser = catchAsync(async (request, response, next) => {
  const user = await User.findOne({ email: request.body.email });
  console.log(user.email);
  if (!user) {
    return next(new AppError("invalid email please sign up", 401));
  }

  const validPassword = await bcrypt.compare(
    request.body.password,
    user.password
  );
  if (!validPassword) {
    throw new Error("invalid password ");
  }
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.EXPIRES_TIME,
  });

  response.status(200).json({
    message: "logged in successfully",
    data: {
      user,
      token,
    },
  });
});


exports.protect = catchAsync(async (request,response,next)=>{
  
  
    let token;
    if(request.headers.authorization && request.headers.authorization.startsWith('Bearer')){
      token = request.headers.authorization.split(' ')[1];
    }
    if (!token) {
      throw new Error("access denied")
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    
    const currentUser = await User.findById(decoded.userId);
    if(!currentUser){
      throw new Error(
        "the user that belong to this token does no longer exist"
      );
    }
    if (currentUser.passwordChangeAt) {
      const convertDateToTimeStamp = parseInt(currentUser.passwordChangeAt.getTime() / 1000,10);
      if(convertDateToTimeStamp> decoded.iat){
        response
          .status(401)
          .json({
            message: "the user change his password please login again",
          });
      }
    }
    request.user = currentUser;
    next();
  
});

exports.allowedTo = (...roles) =>{
  return (request, response, next) => {
      if (!roles.includes(request.user.role)) {
        return next(new Error("you don't have permission for this role", 403));
      }
      next();
    } 
  };