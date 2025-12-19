const executeCode = async (req, res) => {
  try {
    const { code, language, versionIndex } = req.body;

    if (!code || !language) {
      return res.status(400).json({
        error: "code and language are required",
      });
    }

    const response = await fetch("https://api.jdoodle.com/v1/execute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clientId: process.env.JDOODLE_CLIENT_ID,
        clientSecret: process.env.JDOODLE_CLIENT_SECRET,
        script: code,
        language,
        versionIndex,
      }),
    });

    const data = await response.json();

    return res.status(200).json(data);
  } catch (error) {
    console.error("JDoodle execution error:", error);

    return res.status(500).json({
      error: error.message || "Internal Server Error",
    });
  }
};

module.exports = {
  executeCode,
};
