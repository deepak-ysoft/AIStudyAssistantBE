import User from "../models/UserModel.js";
import { generateToken } from "../utils/token.js";

export const signup = async (name, email, password) => {
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new Error("User with this email already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  const token = generateToken(user._id);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      grade: user.grade,
    },
    token,
  };
};

export const login = async (email, password) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new Error("Invalid email or password");
  }

  // 🔥 ACCOUNT DELETED CASE
  if (user.isDeleted) {
    const error = new Error("ACCOUNT_DELETED");
    error.code = "ACCOUNT_DELETED";
    throw error;
  }

  const isPasswordMatch = await user.matchPassword(password);
  if (!isPasswordMatch) {
    throw new Error("Invalid email or password");
  }

  const token = generateToken(user._id);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      grade: user.grade,
      avatar: user.avatar,
    },
    token,
  };
};

export const generateOtp = (length = 6) => {
  const digits = "0123456789";
  let otp = "";

  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }

  return otp;
};

export const getProfile = async (userId) => {
  const user = await User.findOne({ _id: userId, isDeleted: false }).populate(
    "subjects"
  );
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

export const updateProfile = async (userId, updateData) => {
  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};
