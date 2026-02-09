const http = require('http');

const testData = JSON.stringify([{
    "Crop": "Rice",
    "Season": "Kharif",
    "Region": "Uttar_Pradesh",
    "Soil_Type": "Black", 
    "Irrigation_Type": "Canal",
    "Mechanization_Level": "Medium",
    "Labour_Availability": "Medium",
    "Gender_Split": "Mixed",
    "Farm_Size_Acre": 2.5,
    "Task": "Harvesting",
    "Prev_Yield_q_per_acre": 25.0,
    "Weather_Index": 0.9
}]);

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/labour/predict-labour',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(testData)
    }
};

console.log('Testing Labour Prediction API...');
console.log('Test data:', testData);

const req = http.request(options, (res) => {
    console.log(`\nResponse Status: ${res.statusCode}`);
    console.log(`Response Headers:`, res.headers);
    
    let data = '';
    
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log('\n✅ Response Body:');
        try {
            const result = JSON.parse(data);
            console.log(JSON.stringify(result, null, 2));
            
            if (Array.isArray(result) && result.length > 0) {
                console.log('\n🎉 API Test Successful!');
                console.log(`Labour Required: ${result[0].Labour_Required}`);
                console.log(`Demand Level: ${result[0].Labour_Demand_Level}`);
            }
        } catch (err) {
            console.log('Raw response:', data);
            console.log('Parse error:', err.message);
        }
    });
});

req.on('error', (err) => {
    console.error('❌ Request error:', err.message);
});

req.write(testData);
req.end();