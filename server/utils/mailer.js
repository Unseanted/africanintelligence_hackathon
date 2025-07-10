const nodemailer = require('nodemailer');
const { email_user, email_pass } = require('../configs/config');

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: email_user,
      pass: email_pass
    }
  });
};

const sendEnrollmentNotification = async (facilitator, student, course) => {
  try {
    const transporter = createTransporter();
    
    const info = await transporter.sendMail({
      from: `"African Intelligence LMS" <${email_user}>`,
      to: facilitator.email,
      subject: `New Student Enrollment: ${course.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #e53e3e; margin: 0;">African Intelligence LMS</h1>
            <p style="color: #718096; margin-top: 5px;">Advancing Education in Africa</p>
          </div>
          
          <div style="background-color: #f7fafc; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <h2 style="color: #2d3748; margin-top: 0;">New Student Enrollment</h2>
            <p style="color: #4a5568;">A new student has enrolled in your course.</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h3 style="color: #2d3748; margin-bottom: 10px;">Course Details:</h3>
            <p style="margin: 5px 0;"><strong>Course Title:</strong> ${course.title}</p>
            <p style="margin: 5px 0;"><strong>Course ID:</strong> ${course._id}</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h3 style="color: #2d3748; margin-bottom: 10px;">Student Details:</h3>
            <p style="margin: 5px 0;"><strong>Name:</strong> ${student.name}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${student.email}</p>
            <p style="margin: 5px 0;"><strong>Enrollment Date:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <div style="background-color: #f7fafc; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <p style="margin: 0; color: #4a5568;">You can view all enrolled students and manage your course through the African Intelligence LMS platform.</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #718096; font-size: 14px;">
            <p>© ${new Date().getFullYear()} African Intelligence LMS. All rights reserved.</p>
          </div>
        </div>
      `,
    });
    
    console.log('Enrollment notification email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending enrollment notification email:', error);
    return false;
  }
};



const sendWelcomeEmail = async (user, courses = []) => {
  try {
    const transporter = createTransporter();
    
    // Format courses for email (assuming courses is an array of objects with title)
    const courseList = courses.length > 0
      ? `<ul style="list-style: none; padding: 0;">
          ${courses.slice(0, 3).map(course => `
            <li style="margin-bottom: 15px; display: flex; align-items: center;">
              <span style="display: inline-block; width: 8px; height: 8px; background: #e25822; border-radius: 50%; margin-right: 10px;"></span>
              ${course.title}
            </li>
          `).join('')}
         </ul>`
      : '<p>Start your quest with our griot-led courses—explore the tribal hub now!</p>';

    // Send email
    const info = await transporter.sendMail({
      from: `"African Intelligence LMS" <${email_user || 'support@africanintelligence.com'}>`,
      to: user.email,
      subject: 'Welcome to the Tribe - Your African Intelligence Journey Begins!',
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 700px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);">
          <!-- Header -->
          <div style="background: #e25822; padding: 40px 20px; text-align: center; position: relative; overflow: hidden;">
            <div style="position: absolute; top: -50px; left: -50px; width: 100px; height: 100px; background: rgba(255, 255, 255, 0.1); border-radius: 50%;"></div>
            <div style="position: absolute; bottom: -60px; right: -60px; width: 120px; height: 120px; background: rgba(255, 255, 255, 0.1); border-radius: 50%;"></div>
            <h1 style="font-size: 32px; font-weight: 700; margin: 0; color: #ffffff; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);">Welcome, ${user.name}!</h1>
            <p style="font-size: 18px; margin: 10px 0 0; color: #ffd700;">You’ve joined the African Intelligence Tribe</p>
          </div>

          <!-- Body -->
          <div style="padding: 30px 25px;">
            <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px;">Greetings, warrior of the tribe!</p>
            <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px;">The drums of Africa beat for you—welcome to African Intelligence LMS! Here, our griots weave tech and tourism into a legacy of triumph. Your journey to ascendancy starts now.</p>
            
            <div style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 12px; margin: 25px 0;">
              <h2 style="font-size: 22px; font-weight: 600; color: #e25822; margin: 0 0 15px; border-bottom: 2px solid #e25822; padding-bottom: 8px;">Tribal Wisdom Awaits</h2>
              ${courseList}
              <a href="https://africanintelligence.com/courses" style="display: inline-block; margin-top: 15px; padding: 10px 20px; background: #e25822; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; transition: background 0.3s;">Seek Knowledge</a>
            </div>

            <div style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 12px;">
              <h3 style="font-size: 20px; font-weight: 600; color: #ffd700; margin: 0 0 15px;">Forge Your Path</h3>
              <ul style="list-style: none; padding: 0; font-size: 16px; line-height: 1.8;">
                <li style="margin-bottom: 10px; display: flex; align-items: center;">
                  <span style="color: #e25822; margin-right: 10px;">➔</span> Craft your tribal mark in your profile
                </li>
                <li style="margin-bottom: 10px; display: flex; align-items: center;">
                  <span style="color: #e25822; margin-right: 10px;">➔</span> Seek wisdom in our course council
                </li>
                <li style="margin-bottom: 10px; display: flex; align-items: center;">
                  <span style="color: #e25822; margin-right: 10px;">➔</span> Unite with warriors in the tribal hub
                </li>
                <li style="display: flex; align-items: center;">
                  <span style="color: #e25822; margin-right: 10px;">➔</span> Rise with Africa’s digital griots
                </li>
              </ul>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #1a1a1a; padding: 20px; text-align: center; border-top: 1px solid #e25822;">
            <p style="font-size: 14px; margin: 0 0 10px;">Need guidance? Reach our elders at <a href="mailto:support@africanintelligence.com" style="color: #e25822; text-decoration: none; font-weight: 600;">support@africanintelligence.com</a></p>
            <div style="margin: 15px 0;">
              <a href="#" style="margin: 0 15px; color: #ffd700; text-decoration: none; font-size: 14px; transition: color 0.3s;">Facebook</a>
              <a href="#" style="margin: 0 15px; color: #ffd700; text-decoration: none; font-size: 14px; transition: color 0.3s;">Twitter</a>
              <a href="#" style="margin: 0 15px; color: #ffd700; text-decoration: none; font-size: 14px; transition: color 0.3s;">Instagram</a>
            </div>
            <p style="font-size: 12px; color: #999; margin: 0;">© ${new Date().getFullYear()} African Intelligence LMS. Forged in the Tribe.</p>
          </div>
        </div>
      `,
    });
    
    console.log('Welcome email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

module.exports = sendEnrollmentNotification;
module.exports.sendWelcomeEmail = sendWelcomeEmail;
