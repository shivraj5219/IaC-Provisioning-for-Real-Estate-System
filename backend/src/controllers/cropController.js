const { spawn } = require("child_process");
const path = require("path");

exports.predictCrop = async (req, res) => {
  try {
    const { N, P, K, temperature, humidity, ph, rainfall } = req.body;

    // Validate required fields
    if ([N, P, K, temperature, humidity, ph, rainfall].some(v => v === undefined || v === null)) {
      return res.status(400).json({ 
        message: "Please provide all required fields: N, P, K, temperature, humidity, ph, and rainfall" 
      });
    }

    // Prepare input data for Python script
    const inputData = JSON.stringify({ N, P, K, temperature, humidity, ph, rainfall });
    
    // Path to Python script
    const scriptPath = path.join(__dirname, "../ml/predict.py");
    
    // Spawn Python process
    const python = spawn("python", [scriptPath]);
    
    let result = "";
    let error = "";

    // Send input data to Python script via stdin
    python.stdin.write(inputData);
    python.stdin.end();

    // Collect output
    python.stdout.on("data", (data) => {
      result += data.toString();
    });

    python.stderr.on("data", (data) => {
      error += data.toString();
    });

    // Handle completion
    python.on("close", (code) => {
      if (code !== 0 || error) {
        console.error("Python script error:", error);
        return res.status(500).json({ 
          message: "Error running crop prediction model",
          error: error
        });
      }

      try {
        const prediction = JSON.parse(result.trim());
        res.json({
          input: { N, P, K, temperature, humidity, ph, rainfall },
          ...prediction
        });
      } catch (parseError) {
        console.error("Failed to parse Python output:", result);
        res.status(500).json({ 
          message: "Error parsing prediction result",
          rawOutput: result
        });
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
