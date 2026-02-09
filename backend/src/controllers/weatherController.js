// Simple weather controller (mock data)
// The real project can replace this with an API call to a weather provider.

const getWeather = async (req, res) => {
	try {
		const village = req.query.village || req.query.v || 'unknown';
		// Mocked weather data — replace with real API call if needed
		const data = {
			village,
			temperatureC: 30,
			temperatureF: 86,
			condition: 'Sunny',
			source: 'mock'
		};

		return res.json(data);
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

module.exports = {
	getWeather
};
