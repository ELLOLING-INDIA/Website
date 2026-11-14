// Deploy as a Google Apps Script web app executing as the owner.
// Aggregate counts only; no visitor identifiers or form content collected.
const SERVICES = ['software_development', 'amc_services', 'business_consulting'];
function doPost(e) {
  const service = e.parameter.service;
  if (!SERVICES.includes(service)) return ContentService.createTextOutput('ignored');
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const props = PropertiesService.getScriptProperties();
    const day = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd');
    const key = day + ':' + service;
    props.setProperty(key, String(Number(props.getProperty(key) || 0) + 1));
  } finally { lock.releaseLock(); }
  return ContentService.createTextOutput('ok');
}
function sendWeeklyReport() { sendReport(7); }
function sendDailyReport() { sendReport(1); }
function sendReport(days) {
  const props = PropertiesService.getScriptProperties();
  const values = props.getProperties();
  const totals = Object.fromEntries(SERVICES.map(s => [s, 0]));
  for (let i = 1; i <= days; i++) {
    const date = new Date(Date.now() - i * 86400000);
    const day = Utilities.formatDate(date, 'Asia/Kolkata', 'yyyy-MM-dd');
    SERVICES.forEach(s => totals[s] += Number(values[day + ':' + s] || 0));
  }
  MailApp.sendEmail('ellolingindia@gmail.com', 'ELLOLING service clicks — last ' + days + ' completed days',
    Object.entries(totals).map(([s,n]) => s.replace(/_/g,' ') + ': ' + n).join('\n') +
    '\n\nCounts represent clicks, not unique people or confirmed enquiries. Public endpoint counts may include bots.');
  const cutoff = Utilities.formatDate(new Date(Date.now() - 35 * 86400000), 'Asia/Kolkata', 'yyyy-MM-dd');
  Object.keys(values).filter(k => /^\d{4}-\d{2}-\d{2}:/.test(k) && k.slice(0,10) < cutoff).forEach(k => props.deleteProperty(k));
}
function installWeeklyReport() {
  ScriptApp.getProjectTriggers().filter(t => ['sendWeeklyReport','sendDailyReport'].includes(t.getHandlerFunction())).forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('sendWeeklyReport').timeBased().inTimezone('Asia/Kolkata').onWeekDay(ScriptApp.WeekDay.MONDAY).atHour(9).create();
}
