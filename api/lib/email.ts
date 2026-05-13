import nodemailer from 'nodemailer';

export const sendAdmissionEmail = async (admissionData: any) => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const adminEmail = process.env.ADMIN_EMAIL || user;

  if (!user || !pass) {
    console.error('EMAIL_USER o EMAIL_PASS no configurados');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }
  });

  const mailOptions = {
    from: user,
    to: adminEmail,
    subject: 'Nueva Solicitud de Admisión - U.E.P. Francisca Elena Burgos',
    html: `
      <h2>Nueva Solicitud de Admisión Recibida</h2>
      <p><strong>Nombre del Padre/Madre:</strong> ${admissionData.parent_name}</p>
      <p><strong>Correo Electrónico:</strong> ${admissionData.email}</p>
      <p><strong>Teléfono:</strong> ${admissionData.phone}</p>
      <p><strong>Nombre del Estudiante:</strong> ${admissionData.student_name}</p>
      <p><strong>Grado:</strong> ${admissionData.grade}</p>
      <p><strong>Mensaje:</strong> ${admissionData.message || 'N/A'}</p>
      <p><strong>Fecha de Envío:</strong> ${new Date().toLocaleString()}</p>
      <br>
      <p>Por favor, revisa el sistema para más detalles.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Correo de admisión enviado exitosamente');
  } catch (error) {
    console.error('Error enviando correo:', error);
  }
};
