/*
 * Complete this script so that it is able to add a superuser to the database
 * Usage example: 
 *   node prisma/createsu.js clive123 clive.su@mail.utoronto.ca SuperUser123!
 */
const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');

 const prisma = new PrismaClient();

 async function createSuperUser() {
    const [utorid, email, password] = process.argv.slice(2);
    const resetToken = uuidv4();
    expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    const newSuperUser = await prisma.User.create({
        data: {
            utorid: utorid,
            email: email,
            password: password,
            role: 'superuser',
            verified: true,
            activated: true,
            tokens: {
                create: {
                    token: resetToken,
                    expiresAt: expiresAt
                }
            }
        }
    });
 }
 createSuperUser();
'use strict';