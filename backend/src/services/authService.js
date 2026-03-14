const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();
const uuid = require('uuid');

const updateUserLogin = async (utorid) => {

  await prisma.user.update({
    where: { utorid: utorid }, 
    data: { lastLogin: new Date(Date.now())}
  });

};

const verifyUser = async (utorid) => {

  await prisma.user.update({
    where: { utorid: utorid }, 
    data: { activated: true }
  });

};

const generateResetPasswordToken = async (utorid) => {

  const resetToken = uuid.v4();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

  // overwrite any previous tokens
  await prisma.resetToken.upsert({
    where: { utorid: utorid },
    update: { token: resetToken, expiresAt: expiresAt, usedAt: null },
    create: { utorid: utorid, token: resetToken, expiresAt: expiresAt },
  });

  // prisma automatically adds reset token to user table via relation

  return { resetToken, expiresAt }
};

const getResetTokenRow = async (resetToken) => {

  return await prisma.resetToken.findUnique({
      where: { token: resetToken },
      include: { user: true }
  });

};

const updatePassword = async (utorid, password, resetToken, now) => {
  await prisma.$transaction(async (prisma) => {
      
    // token marked as used
    await prisma.resetToken.update({
      where: { token: resetToken },
      data: { usedAt: now }
    });

    // update user password
    await prisma.user.update({
      where: { utorid: utorid },
      data: { password: password }
    });
    
  });
};

module.exports = {
  updateUserLogin,
  verifyUser,
  generateResetPasswordToken,
  getResetTokenRow,
  updatePassword,
}