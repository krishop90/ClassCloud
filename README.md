# EduConnect
EduConnect is platform for the students and teachers to be gather on one platform and solve doubts and create communities and grow together

This platform is all about leaning from others and sharing personal knowledge to other student

Features Implemented
1. User Authentication & Authorization
Sign Up: Users can register by providing their name, email, and password.
Login: Registered users can log in with their credentials to receive a JWT token for session management.
Forgot Password: Users can request a password reset link to be sent to their email.
Password Reset: After receiving the reset link, users can reset their password securely.

2. Password Reset Flow
Email with Reset Link: A password reset email is sent to users after requesting a reset, with a valid token in the URL.
Token Verification: The reset token is verified before allowing the user to change their password.

3. Lecture Management
Create Lecture: Admins and instructors can create new lectures, specifying details like title, description, date, and time.
Get Lectures: Users can fetch a list of lectures, with filtering options like course or date.
Attend Lectures: Students can mark themselves as attending lectures.

4. Lecture Materials Upload (Planned)
Upload Notes/Presentations: Instructors can upload lecture materials (such as PDF or PPT files) for students.
