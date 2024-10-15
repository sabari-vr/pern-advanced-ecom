import bcryptjs from "bcryptjs";
import crypto from "crypto";
import prisma from "../config/prisma.js";

import jwt from "jsonwebtoken";

import {
  sendPasswordResetEmail,
  sendResetSuccessEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../email/emails.js";
// import { User, Token } from "../models/user.model.js";

export const signup = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    if (!email || !password || !name) {
      throw new Error("All fields are required");
    }

    const userAlreadyExists = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (userAlreadyExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const verificationTokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        verificationToken,
        verificationTokenExpiresAt,
        cartItems: [],
        wishList: [],
      },
    });

    await sendVerificationEmail(user.email, verificationToken);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  const { code } = req.body;
  try {
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: code,
        verificationTokenExpiresAt: {
          gte: new Date(),
        },
      },
    });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    const activeTokens = await prisma.token.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    if (activeTokens.length >= 3) {
      const oldestToken = activeTokens[0];
      await prisma.token.delete({
        where: {
          id: oldestToken.id,
        },
      });
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role,
        email: user.email,
      },
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.ACCESS_TOKEN_LIFE,
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.REFRESH_TOKEN_LIFE,
    });

    await prisma.token.create({
      data: {
        userId: user.id,
        token: accessToken,
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLogin: new Date(),
        isVerified: true,
        verificationToken: null,
        verificationTokenExpiresAt: null,
      },
    });

    await sendWelcomeEmail(user.email, user.name);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      accessToken,
      refreshToken,
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.log("error in verifyEmail ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      const verificationToken = Math.floor(
        100000 + Math.random() * 900000
      ).toString();
      await prisma.user.update({
        where: { id: user.id },
        data: {
          verificationToken: verificationToken,
          verificationTokenExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
        },
      });

      await sendVerificationEmail(user.email, verificationToken);

      return res.status(403).json({
        success: false,
        message: "Account not verified. Verification token has been resent.",
        verificationToken,
      });
    }

    const activeTokens = await prisma.token.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    if (activeTokens.length >= 3) {
      const oldestToken = activeTokens[0];
      await prisma.token.delete({
        where: {
          id: oldestToken.id,
        },
      });
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role,
        email: user.email,
      },
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.ACCESS_TOKEN_LIFE,
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.REFRESH_TOKEN_LIFE,
    });

    await prisma.token.create({
      data: {
        userId: user.id,
        token: accessToken,
      },
    });

    const updatetedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLogin: new Date(),
      },
    });

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      accessToken,
      refreshToken,
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
        lastLogin: updatetedUser.lastLogin,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.log("Error in login ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  const authHeader = req.header("Authorization");
  const token = authHeader.split(" ")[1];

  try {
    await prisma.token.deleteMany({
      where: {
        token: token,
      },
    });

    res.json({ message: "Logout successful" });
  } catch (err) {
    console.log(err);

    res.status(500).json({ message: "Server Error" });
  }
};

export const logoutAll = async (req, res) => {
  try {
    await prisma.token.deleteMany({
      where: {
        userId: req.user.id,
      },
    });
    res.json({ message: "Logged out from all devices" });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpiresAt: resetTokenExpiresAt,
      },
    });

    // send email
    await sendPasswordResetEmail(
      user.email,
      `${req.header("origin")}/reset-password/${resetToken}`
    );

    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    console.log("Error in forgotPassword ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
      },
      select: {
        id: true,
        resetPasswordExpiresAt: true,
        email: true,
      },
    });

    if (!user || user.resetPasswordExpiresAt < new Date()) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired reset token" });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpiresAt: null,
      },
    });
    console.log(user);

    await sendResetSuccessEmail(user.email);

    res
      .status(200)
      .json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.log("Error in resetPassword ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const refreshToken = async (req, res) => {
  const { accessToken: OldAccessToken, refreshToken } = req.body;

  if (!refreshToken || !OldAccessToken) {
    return res.sendStatus(401);
  }

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const accessToken = jwt.sign(
      { user: payload.user, email: payload.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_LIFE }
    );

    const tokenToUpdate = await prisma.token.findFirst({
      where: {
        userId: payload.user.id,
        token: OldAccessToken,
      },
    });

    if (!tokenToUpdate) {
      throw new Error("Token not found");
    }

    const updatedToken = await prisma.token.update({
      where: {
        id: tokenToUpdate.id,
      },
      data: {
        token: accessToken,
      },
    });

    if (!updatedToken) {
      return res.sendStatus(403);
    }

    res.json({ accessToken, refreshToken });
  } catch (err) {
    console.error(err.message);
    res.sendStatus(403);
  }
};
