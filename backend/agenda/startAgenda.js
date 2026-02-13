const agenda = require("./index");

// load jobs
require("./jobs/roundNoShow.job")(agenda);

module.exports = async function startAgenda() {
  await agenda.start();
  console.log("[AGENDA] Started");
};
