/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     description: Creates a new user with the given details.
 *     parameters:
 *       - in: formData
 *         name: name
 *         required: true
 *         type: string
 *       - in: formData
 *         name: email
 *         required: true
 *         type: string
 *       - in: formData
 *         name: password
 *         required: true
 *         type: string
 *       - in: formData
 *         name: phone
 *         required: true
 *         type: string
 *       - in: formData
 *         name: userType
 *         required: true
 *         type: string
 *         enum: [user, admin]
 *       - in: formData
 *         name: profileImg
 *         type: file
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
 *   get:
 *     summary: Get all users
 *     description: Fetches all users from the database.
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: number
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   userType:
 *                     type: string
 *                     enum: [user, admin]
 *                   profileImg:
 *                     type: string
 * /users/{id}:
 *   put:
 *     summary: Update a user
 *     description: Updates the details of an existing user.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *               userType:
 *                 type: string
 *                 enum: [user, admin]
 *               profileImg:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
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
 *   delete:
 *     summary: Delete a user
 *     description: Deletes a user based on the provided user ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       204:
 *         description: User deleted successfully
 */
