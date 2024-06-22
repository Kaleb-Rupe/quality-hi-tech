import React, { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import emailjs from "@emailjs/browser";
import "../../css/contact-form-page.css";

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

  const validateEmail = useCallback((value) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(value) || "Invalid email address";
  }, []);

  const sendEmail = useCallback((data) => {
    const serviceID = "service_rv66zp1";
    const templateID = "template_o0s4yot";

    emailjs.init({
      publicKey: "hohx4dG5zc1Gehn9H",
      blockHeadless: false,
      limitRate: {
        id: "app",
        throttle: 10000,
      },
    });

    emailjs
      .send(serviceID, templateID, data)
      .then((response) => {
        console.log("Email sent successfully!", response.status, response.text);
        setSubmissionStatus("success");
      })
      .catch((error) => {
        console.error("Failed to send email:", error);
        setSubmissionStatus("error");
      });
  }, []);

  const onSubmit = useCallback(
    (data) => {
      sendEmail(data);
      reset();
    },
    [reset, sendEmail]
  );

  if (submissionStatus === "success") {
    return (
      <div className="success-message">
        <h2>Thank you!</h2>
        <p>Your message has been sent successfully.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form-wrapper">
      <div className="form-group">
        <label htmlFor="name">Full Name:</label>
        <input
          id="name"
          {...register("name", {
            required: "Name is required.",
            minLength: {
              value: 2,
              message: "Name must be at least 2 characters long.",
            },
            maxLength: {
              value: 50,
              message: "Name cannot exceed 50 characters.",
            },
          })}
          placeholder="Your Full Name"
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
          type="email"
          {...register("email", {
            required: "Email is required.",
            validate: validateEmail,
          })}
          placeholder="Your Email Address"
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
          type="tel"
          {...register("phone", {
            pattern: {
              value: /^[0-9]{6,15}$/,
              message: "Please enter a valid phone number.",
            },
          })}
          placeholder="Your Phone Number (optional)"
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
          {...register("message", {
            required: "Message is required.",
            maxLength: {
              value: 500,
              message: "Message cannot exceed 500 characters.",
            },
          })}
          placeholder="Your message..."
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
  );
};

export default React.memo(Form);
