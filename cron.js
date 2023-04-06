const { handleSelection } = require('./index');

const CronJob = require('cron').CronJob;

const job = new CronJob(
    '0 12/15 * * * *',
    handleSelection
);

job.start()