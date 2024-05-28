import React, { useState } from "react";
import { useForm } from "react-hook-form";
import emailjs from "@emailjs/browser";
import "./form_page.css";

const Form = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  const [submissionStatus, setSubmissionStatus] = useState("");

  const onSubmit = (data) => {
    sendEmail(data);
    reset();
  };

  const validateEmail = (value) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(value)) {
      return "Invalid email address";
    }
    return true;
  };

  // Function to send email using EmailJS
  const sendEmail = (data) => {
    const serviceID = "service_rv66zp1"; // replace with your service ID
    const templateID = "template_o0s4yot"; // replace with your template ID

    emailjs.init({
      publicKey: "hohx4dG5zc1Gehn9H",
      // Do not allow headless browsers
      blockHeadless: false,
      limitRate: {
        // Set the limit rate for the application
        id: "app",
        // Allow 1 request per 10s
        throttle: 10000,
      },
    });

    // Here you would send the email using an emailjs.
    emailjs
      .send(serviceID, templateID, {
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
      })
      .then((response) => {
        console.log("Email sent successfully!", response.status, response.text);
        setSubmissionStatus("success");
      })
      .catch((error) => {
        console.error("Failed to send email:", error);
        setSubmissionStatus("error");
      });

    console.log("Sending email with the data.");
  };

  return (
    <div>
      {submissionStatus === "success" ? (
        <div className="success-message">
          <h2>Thank you!</h2>
          <p>Your message has been sent successfully.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="form-wrapper">
          <div className="form-group">
            <label htmlFor="name">First Name:</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Full Name"
              {...register("name", {
                required: "First name is required.",
                minLength: {
                  value: 2,
                  message: "First name must be at least 2 characters long.",
                },
                maxLength: {
                  value: 32,
                  message: "First name cannot exceed 32 characters.",
                },
              })}
            />
            {errors.name && (
              <p role="alert" className="error-message">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Email"
              {...register("email", {
                required: "Email is required.",
                minLength: {
                  value: 7,
                  message: "Email must be at least 7 characters long.",
                },
                maxLength: {
                  value: 29,
                  message: "Email cannot exceed 29 characters.",
                },
                validate: validateEmail,
              })}
            />
            {errors.email && (
              <p role="alert" className="error-message">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number:</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Mobile Number"
              {...register("phone", {
                minLength: {
                  value: 6,
                  message: "Phone number must be at least 6 characters long.",
                },
                maxLength: {
                  value: 12,
                  message: "Phone number cannot exceed 12 characters.",
                },
              })}
            />
            {errors.phone && (
              <p role="alert" className="error-message">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="message">Message:</label>
            <textarea
              id="message"
              name="message"
              placeholder="Your message..."
              {...register("message", {
                maxLength: {
                  value: 120,
                  message: "Message cannot exceed 120 characters.",
                },
              })}
            />
            {errors.message && (
              <p role="alert" className="error-message">
                {errors.message.message}
              </p>
            )}
          </div>

          <button type="submit" className="submit-button">
            Submit
          </button>
        </form>
      )}
    </div>
  );
};

export default Form;
