const { spawn } = require("child_process");
const path = require("path");

exports.predictYield = async (req, res) => {
  try {
    const { State, Year, Season, Crop, Area, Rainfall, Temperature, Fertilizer, Pesticide } = req.body;

    // Validate required fields
    if ([State, Year, Season, Crop, Area, Rainfall].some(v => v === undefined || v === null)) {
      return res.status(400).json({ 
        message: "Please provide all required fields: State, Year, Season, Crop, Area, Rainfall" 
      });
    }

    // Prepare input data for Python script with all parameters
    const inputData = JSON.stringify({ 
      State, 
      Year, 
      Season, 
      Crop, 
      Area, 
      Rainfall,
      Temperature: Temperature || 25,
      Fertilizer: Fertilizer || 150,
      Pesticide: Pesticide || 3
    });
    
    // Path to Python script
    const scriptPath = path.join(__dirname, "../ml/predict_yield.py");
    
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
          message: "Error running yield prediction model",
          error: error
        });
      }

      try {
        const prediction = JSON.parse(result.trim());
        res.json({
          input: { 
            State, 
            Year, 
            Season, 
            Crop, 
            Area, 
            Rainfall,
            Temperature: Temperature || 25,
            Fertilizer: Fertilizer || 150,
            Pesticide: Pesticide || 3
          },
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

