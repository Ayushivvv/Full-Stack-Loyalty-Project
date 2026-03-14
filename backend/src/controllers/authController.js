const jwt = require('jsonwebtoken');
const rateLimiter = require('../middleware/rateLimiter.js');
const userService = require('../services/userService.js');
const authService = require('../services/authService.js');
const nodemailer = require("nodemailer");

async function getJWTs(req, res, next) {
  try {
    const { utorid, password } = req.body;

    // if no utorid or no password or if payload has extra fields
    if ( utorid === undefined || password === undefined || Object.keys(req.body).length > 2) {
      return res.status(400).json({ error: 'Bad Request'});
    }


    const user = await userService.getUserByUtorid(utorid);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials: user' });
    }

    const passwordMatch = password === user.password;
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    const payload = { utorid: user.utorid, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    // update last login date
    await authService.updateUserLogin(utorid);

    // mark user as activated if its their first login
    if (!user.activated) {
      await authService.verifyUser(utorid);
    }

    res.status(200).json({ token: token, expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000)});
  }
  catch (err) {
    next(err);
  }
};

async function googleLogin(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email required" });
    }

    const user = await userService.getUserByEmail(email);
    if (!user) {
      return res.status(403).json({ error: "User not allowed" });
    }

    // update last login date
    await authService.updateUserLogin(user.utorid);

    const payload = { utorid: user.utorid, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ token, expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000)});
  }
  catch (err) {
    next(err);
  }
}

async function getResetToken(req, res, next) {
  try {

    const utorid = req.body.utorid;

    // if no utorid
    if ( utorid === undefined || Object.keys(req.body).length > 1) {
      return res.status(400).json({ error: 'Bad Request'});
    }

    const user = await userService.getUserByUtorid(utorid);

    if (user) {
      // expires after 1 hour
      const { resetToken, expiresAt } = await authService.generateResetPasswordToken(utorid);
      rateLimiter.markResetSuccess(req);

      const frontendUrl = process.env.FRONTEND_URL;
      const resetUrl = `${frontendUrl}/reset-password/${resetToken}?utorid=${utorid}`;

      await sendResetEmail(user, resetUrl);

      return res.status(202).json({ resetToken: resetToken, expiresAt: expiresAt });
    }

    return res.status(404).json({ error: "User not found"})
    
  }
  catch (err) {
    next(err);
  }
}

async function sendResetEmail(user, resetUrl) {

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "Reset Your Password",
    text: `Click the link to reset your password: ${resetUrl}`,
    html: `
      <p>You requested a password reset.</p>
      <p><a href="${resetUrl}">Click here to reset your password</a></p>
      <p>This link expires in 1 hour.</p>
    `,
  });
}

async function resetPassword(req, res, next) {
  try {
    const { resetToken } = req.params;
    const { utorid, password } = req.body;

    // check if no utorid or password
    if ( utorid === undefined || password === undefined || Object.keys(req.body).length > 2) {
      return res.status(400).json({ error: 'Bad Request'});
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,20}$/;
    // if password is invalid
    if (!passwordRegex.test(password)) {
      return res.status(400).json({error: 'Invalid Password'})
    }

    // check if reset token exists
    const tokenRow = await authService.getResetTokenRow(resetToken);

    if (!tokenRow) {
      return res.status(404).json({ error: 'Reset token not found' });
    }

    // must belong to the same utorid (avoid using someone else’s token)
    if (tokenRow.user.utorid !== utorid) {
      return res.status(401).json({ error: 'Reset token does not match user' });
    }

    // if reset token has been used
    if (tokenRow.usedAt) {
      return res.status(410).json({ error: 'Reset token has already been used' });
    }

    // check if reset token is expired
    const now = new Date();
    if (tokenRow.expiresAt < now) {
      return res.status(410).json({ error: 'Reset token has expired' });
    }
    
    await authService.updatePassword(utorid, password, resetToken, now);

    return res.status(200).json({ message: 'Password reset successful' });
  }
  catch (err) {
    next(err);
  }
};

module.exports = { getJWTs, googleLogin, getResetToken, resetPassword };
