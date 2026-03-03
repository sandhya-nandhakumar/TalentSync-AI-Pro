const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../services/db');

exports.register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;

        db.run(sql, [name, email, hashedPassword], function (err) {
            if (err) {
                return res.status(400).json({ error: 'Email already exists' });
            }
            res.status(201).json({ id: this.lastID, name, email });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.login = (req, res) => {
    const { email, password } = req.body;

    const sql = `SELECT * FROM users WHERE email = ?`;
    db.get(sql, [email], async (err, user) => {
        if (err || !user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, name: user.name },
            process.env.JWT_SECRET || 'secretkey',
            { expiresIn: '24h' }
        );

        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    });
};

exports.updatePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const sql = `SELECT password FROM users WHERE id = ?`;
    db.get(sql, [userId], async (err, user) => {
        if (err || !user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const validPassword = await bcrypt.compare(currentPassword, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Incorrect current password' });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        const updateSql = `UPDATE users SET password = ? WHERE id = ?`;
        db.run(updateSql, [hashedNewPassword, userId], (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'Password updated successfully' });
        });
    });
};
