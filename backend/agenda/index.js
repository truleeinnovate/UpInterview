const Agenda = require("agenda");

const agenda = new Agenda({
  db: {
    address: process.env.MONGODB_URI,
    collection: "agendaJobs",
  },
});
// console.log("[DEBUG] agenda keys:", Object.keys(agenda));
// console.log("[DEBUG] typeof agenda.schedule:", typeof agenda.schedule);
module.exports = agenda;
