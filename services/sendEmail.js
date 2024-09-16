const { Resend } =require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (email,otp)=>{ 
  try{
    await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: [email],
      subject: 'Please verify your email',
      html: `<p>Please use this time password ${otp}</p> `,
    });
  }catch(error){
    console.log(error);
  }
}

module.exports = sendEmail;