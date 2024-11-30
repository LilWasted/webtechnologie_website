const nodemailer = require('nodemailer');
const Event = require('../models/event');

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

        const subject = `Reminder: ${event.title}`;
        const text = `Hello, this is a reminder for the event, 1 hour until ${event.title} on ${event.date}.`;
        for (const participant of event.participants) {
            await sendMail(participant.email, subject, text);
        }
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

module.exports = { sendEventReminder };