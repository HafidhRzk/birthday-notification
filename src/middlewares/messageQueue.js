const Bull = require('bull');
const axios = require('axios');

const sendMessageQueue = new Bull('sendMessageQueue');

sendMessageQueue.process('*', async (job, done) => {
    try {
        console.log(`${job.name} sent`);
        await axios.post('https://eofzabld632g55p.m.pipedream.net/api/send-messages', { message: job.data.message });
        done();
    } catch (error) {
        done(new Error(error.message));
    }
});

sendMessageQueue.on('completed', async (job) => {
    await sendMessageQueue.removeRepeatableByKey(job.opts.repeat.key);
    console.log(`${job.name} has been complete`);
    const jobtoremove = await sendMessageQueue.getFailed();
    jobtoremove.map(async (dt) => {
        await sendMessageQueue.removeJobs(dt.id);
    });
});

sendMessageQueue.on('failed', async (job, err) => {
    console.log(`${job.name} failed to process`);
    console.log(`caused by ${err.message}`);
});
sendMessageQueue.on('error', (err) => console.log(`err ${err.message}`));

module.exports = sendMessageQueue;
