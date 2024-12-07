/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: User Signup
 *     description: Creates a new user with the provided details.
 *     parameters:
 *       - in: formData
 *         name: name
 *         required: true
 *         type: string
 *         description: Name of the user
 *       - in: formData
 *         name: email
 *         required: true
 *         type: string
 *         description: Email of the user
 *       - in: formData
 *         name: password
 *         required: true
 *         type: string
 *         description: Password of the user
 *       - in: formData
 *         name: phone
 *         required: true
 *         type: string
 *         description: Phone number of the user
 *       - in: formData
 *         name: userType
 *         required: true
 *         type: string
 *         enum: [user, admin]
 *         description: Type of user
 *       - in: formData
 *         name: profileImg
 *         type: file
 *         description: Profile image of the user
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 phone:
 *                   type: string
 *                 userType:
 *                   type: string
 *                   enum: [user, admin]
 *                 profileImg:
 *                   type: string
 * /auth/login:
 *   post:
 *     summary: User Login
 *     description: Authenticates a user and returns a token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email of the user
 *               password:
 *                 type: string
 *                 description: Password of the user
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: number
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                 token:
 *                   type: string
 * /auth/reset-password:
 *   post:
 *     summary: Reset Password
 *     description: Resets the user's password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email of the user
 *               newPassword:
 *                 type: string
 *                 description: New password
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 * /auth/change-password:
 *   put:
 *     summary: Change Password
 *     description: Allows the user to change their password.
 *     security:
 *       - jwt: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: Current password of the user
 *               newPassword:
 *                 type: string
 *                 description: New password
 *     responses:
 *       200:
 *         description: Password change successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
