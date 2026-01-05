import User from "../models/UserModel.js";
import { generateToken } from "../utils/token.js";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

export const signup = async (name, email, password) => {
  email = email.toLowerCase();

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new Error("User with this email already exists");
  }

  const { hashedToken } = await sendMail(email, name);

  await User.create({
    name,
    email,
    password,
    isEmailVerified: false,
    verificationToken: hashedToken,
  });

  return {
    message: "Registration successful. Please verify your email.",
  };
};

export const login = async (email, password) => {
  email = email.toLowerCase();

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  if (!user.isEmailVerified) {
    const error = new Error("EMAIL_NOT_VERIFIED");
    error.code = "EMAIL_NOT_VERIFIED";
    throw error;
  }

  if (user.isDeleted) {
    const error = new Error("ACCOUNT_DELETED");
    error.code = "ACCOUNT_DELETED";
    throw error;
  }

  const isPasswordMatch = await user.matchPassword(password);
  if (!isPasswordMatch) {
    throw new Error("INVALID_CREDENTIALS");
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

const sendMail = async (email, name) => {
  try {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const verifyUrl = `${process.env.FRONTEND_URL}/auth/verify-email/${rawToken}`;

    await sendEmail({
      to: email,
      subject: "Verify your email",
      html: `
        <p>Hello ${name},</p>
        <p>Please verify your email:</p>
        <a href="${verifyUrl}">Verify Email</a>
      `,
    });

    return { hashedToken };
  } catch {
    throw new Error("Email sending failed");
  }
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
