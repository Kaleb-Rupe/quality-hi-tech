import React, { useState } from "react";
import { useForm } from "react-hook-form";

export default function App() {
  const [formData, setFormData] = useState({});

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = (data) => {
    reset();
  };

  const validateEmail = (value) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(value)) {
      return "Invalid email address";
    }
    return null;
  };

  const handleFormChange = (event) => {
    setFormData((prevState) => ({
      ...prevState,
      [event.target.name]: event.target.value,
    }));
  };

  /*Trying to work out how to get email working*/

  //   const onSubmit = (data) => {
  //     // data.preventDefault();
  //     // Send the form data to your email function
  //     // sendEmail(data);
  //   };

  //   //   function sendEmail(data) {
  //   //     // Send the form data to email service
  //   //     // For example, you can use a library like nodemailer
  //   //     const mailOptions = {
  //   //       from: "your-email@example.com",
  //   //       to: "recipient-email@example.com",
  //   //       subject: "Form Submission",
  //   //       text: `Name: ${data.name}, Email: ${data.email}`,
  //   //     };
  //   //     // Send the email
  //   //   }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <label htmlFor="firstName">First Name:</label>
      <input
        name="firstName"
        type="text"
        value={formData.firstName}
        onChange={handleFormChange}
        placeholder="First name"
        {...register("First Name", { required: true, maxLength: 80 })}
      />
      {errors.firstName && <p role="alert">First name is required.</p>}
      <label htmlFor="lastName">Last Name:</label>
      <input
        name="lastName"
        type="text"
        value={formData.lastName}
        onChange={handleFormChange}
        placeholder="Last Name"
        {...register("Last name", { required: true, maxLength: 100 })}
      />
      {errors.lastName && <p role="alert">Last name is required.</p>}
      <label htmlFor="email">Email:</label>
      <input
        name="email"
        type="email"
        value={formData.email}
        onChange={handleFormChange}
        placeholder="Email "
        {...register("Email", {
          required: true,
          min: 7,
          maxLength: 29,
          validate: validateEmail,
        })}
      />
      {errors.email && <p role="alert">Email is required and must be valid.</p>}
      <label htmlFor="tel">Phone Number:</label>
      <input
        name="number"
        type="tel"
        value={formData.number}
        onChange={handleFormChange}
        placeholder="Mobile number"
        {...register("Mobile number", {
          required: false,
          minLength: 6,
          maxLength: 12,
        })}
      />
      <label htmlFor="message">Message:</label>
      <textarea
        id="message"
        name="message"
        value={formData.message}
        onChange={handleFormChange}
      />
      <input type="submit" />
    </form>
  );
}
