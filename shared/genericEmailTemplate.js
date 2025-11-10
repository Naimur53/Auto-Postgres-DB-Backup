const genericEmailTemplate = ({backupStatus, backupFileName, completedAt, error}) => { 
    const statusBgColor = backupStatus === 'Success' ? '#6FD596' : backupStatus === 'Pending' ? '#FFC107' : '#FF6B6B';
    const statusTextColor = backupStatus === 'Success' ? '#4F8A10' : backupStatus === 'Pending' ? '#D8000C' : '#D8000C';

    return `
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Database Backup Notification</title>
</head>
<body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color: #f4f4f4;">

  <!-- Wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding: 20px 0;">
    <tr>
      <td align="center">

        <!-- Email container -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background-color: #6FD596; padding: 20px; text-align: center;">
              <h1 style="margin:0; font-size: 24px; color: #ffffff;">Database Backup Status</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 30px; color: #333333; font-size: 16px; line-height: 1.5;">

              <p>Hello Acctbazaar Admin,</p>

              <p>Your database backup is ${backupStatus}. Here are the details:</p>

              <!-- Status Box -->
              <p style="background-color: ${statusBgColor}; color: ${statusTextColor}; padding:15px; border-radius:5px; font-weight:bold;">
                Status: ${backupStatus}
              </p>

              <p>
                Backup file: <strong>${backupFileName}</strong><br/>
                Completed at: <strong>${completedAt}</strong><br/> 
              </p>

              <p>If the backup failed, please check your server logs and take necessary action.</p>

              <p style="margin-top:30px;">Regards,<br>Naimur Rahman</p>

            </td>
          </tr>
 

        </table>
        <!-- End email container -->

      </td>
    </tr>
  </table>
  <!-- End wrapper -->

</body>
</html>

    `;
};
export default genericEmailTemplate;