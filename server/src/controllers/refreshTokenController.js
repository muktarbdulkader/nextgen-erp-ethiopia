const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'mukti-secret-key-change-me';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'mukti-refresh-secret-change-me';

// Generate secure random token
function generateRefreshToken() {
    return crypto.randomBytes(64).toString('hex');
}

// Create refresh token
exports.createRefreshToken = async (req, res) => {
    try {
        const { userId, email } = req.user;

        // Generate refresh token
        const refreshToken = generateRefreshToken();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

        // Store refresh token in database
        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId,
                expiresAt
            }
        });

        res.json({
            refreshToken,
            expiresIn: '7d'
        });

    } catch (error) {
        console.error('Create refresh token error:', error);
        res.status(500).json({ message: 'Failed to create refresh token' });
    }
};

// Refresh access token
exports.refreshAccessToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({ message: 'Refresh token required' });
        }

        // Find refresh token in database
        const storedToken = await prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true }
        });

        if (!storedToken) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }

        // Check if token is expired
        if (storedToken.expiresAt < new Date()) {
            await prisma.refreshToken.delete({ where: { token: refreshToken } });
            return res.status(401).json({ message: 'Refresh token expired' });
        }

        // Get user permissions
        const roleData = await prisma.role.findUnique({
            where: {
                name_companyName: {
                    name: storedToken.user.role || 'User',
                    companyName: storedToken.user.companyName
                }
            }
        });

        const permissions = roleData?.permissions || ['View Data'];

        // Create new access token
        const accessToken = jwt.sign({
            userId: storedToken.user.id,
            email: storedToken.user.email,
            companyName: storedToken.user.companyName,
            displayCompanyName: storedToken.user.displayCompanyName,
            role: storedToken.user.role,
            permissions
        }, JWT_SECRET, { expiresIn: '15m' });

        // Optionally rotate refresh token (security best practice)
        const newRefreshToken = generateRefreshToken();
        const newExpiresAt = new Date();
        newExpiresAt.setDate(newExpiresAt.getDate() + 7);

        // Delete old token and create new one
        await prisma.refreshToken.delete({ where: { token: refreshToken } });
        await prisma.refreshToken.create({
            data: {
                token: newRefreshToken,
                userId: storedToken.userId,
                expiresAt: newExpiresAt
            }
        });

        res.json({
            accessToken,
            refreshToken: newRefreshToken,
            expiresIn: '15m',
            user: {
                id: storedToken.user.id,
                email: storedToken.user.email,
                firstName: storedToken.user.firstName,
                lastName: storedToken.user.lastName,
                role: storedToken.user.role,
                permissions
            }
        });

    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({ message: 'Failed to refresh token' });
    }
};

// Logout (revoke refresh token)
exports.logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (refreshToken) {
            await prisma.refreshToken.delete({
                where: { token: refreshToken }
            }).catch(() => {
                // Token might not exist, that's okay
            });
        }

        res.json({ message: 'Logged out successfully' });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Failed to logout' });
    }
};

// Logout from all devices
exports.logoutAll = async (req, res) => {
    try {
        const { userId } = req.user;

        // Delete all refresh tokens for this user
        await prisma.refreshToken.deleteMany({
            where: { userId }
        });

        res.json({ message: 'Logged out from all devices successfully' });

    } catch (error) {
        console.error('Logout all error:', error);
        res.status(500).json({ message: 'Failed to logout from all devices' });
    }
};

// Clean up expired tokens (call this periodically)
exports.cleanupExpiredTokens = async () => {
    try {
        const result = await prisma.refreshToken.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date()
                }
            }
        });

        console.log(`Cleaned up ${result.count} expired refresh tokens`);
        return result.count;

    } catch (error) {
        console.error('Cleanup expired tokens error:', error);
        return 0;
    }
};
