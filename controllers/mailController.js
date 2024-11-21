const nodemailer = require('nodemailer');
const Event = require('../models/event');
const cron = require('node-cron');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.APP_PASS
    }
});

const sendMail = async (to, subject, text) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: subject,
        text: text
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.error('Error sending email: ' + error);
    }
}

const sendEventReminder = async (eventId) => {
    try {
        const event = await Event.findById(eventId).populate('participants').exec();
        if(!event) {
            console.error('Event not found');
            return;
        }

        console.log('Sending reminder for event:', event.title);
        const subject = `Reminder: ${event.title}`;
        const text = `Hello, this is a reminder for the event, 1 hour until ${event.title} on ${event.date}.`;
        for (const participant of event.participants) {
            console.log('Sending email to:', participant.email);
            await sendMail(participant.email, subject, text);
        }
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

//schedule a cron job to run every minute
cron.schedule('* * * * *', async () => {
    const events = await Event.find({
        date: { $gte: new Date(), $lt: new Date(Date.now() + 3600000) },
        remindersent: false
    });

    for (const event of events) {
        await sendEventReminder(event._id);
        event.remindersent = true;
        await event.save();
    }
});