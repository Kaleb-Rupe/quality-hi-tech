import React, { useState } from "react";

import { useForm } from "react-hook-form";

const Form = () => {
  const [formData, setFormData] = useState({
    message: "",
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  const onSubmit = (data) => {
    // data.preventDefault();
    // Send the form data to your email function
    // sendEmail(data);
  };

  //   function sendEmail(data) {
  //     // Send the form data to email service
  //     // For example, you can use a library like nodemailer
  //     const mailOptions = {
  //       from: "your-email@example.com",
  //       to: "recipient-email@example.com",
  //       subject: "Form Submission",
  //       text: `Name: ${data.name}, Email: ${data.email}`,
  //     };
  //     // Send the email
  //   }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <label htmlFor="name">Name</label>
      <input type="text" {...register("name", { required: true })} />
      {errors.name && <p>Name is required</p>}

      <label htmlFor="email">Email</label>
      <input
        type="email"
        {...register("email", { required: true, pattern: /^\S+@\S+$/i })}
      />
      {errors.email && <p>Email is required and must be valid</p>}

      <label htmlFor="message">Message:</label>
      <textarea
        id="message"
        name="message"
        value={formData.message}
        onChange={handleChange}
      />

      <button type="submit">Submit</button>
    </form>
  );
};

export default Form;
