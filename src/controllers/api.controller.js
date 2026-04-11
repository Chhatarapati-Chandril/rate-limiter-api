const testLimiter = (type) => async (req, res) => {
    res.status(200).json({
        message: `${type} limiter passed`,
        success: true,
        timestamp: new Date().toISOString(),
    });
};

export default testLimiter