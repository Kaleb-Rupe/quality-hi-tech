import React, { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import emailjs from "@emailjs/browser";
import "../css/contact.css";

const ContactForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      message: "",
    },
  });

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

  const [submissionStatus, setSubmissionStatus] = useState("");

  const onSubmit = useCallback(
    (data) => {
      sendEmail(data);
      reset();
    },
    [reset, sendEmail]
  );

  if (submissionStatus === "success") {
    return (
      <div className="success-message-contact">
        <h2>Thank you!</h2>
        <p>Your message has been sent successfully.</p>
        <p>We will be in contact with you soon.</p>
      </div>
    );
  }

  return (
    <div className="wrapper">
      <div className="contact-container">
        <h2>Leave Us A Message</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="contact-form">
          <div className="form-group-container">
            <div className="form-group">
              <label htmlFor="firstName">First Name:</label>
              <input
                id="firstName"
                {...register("firstName", {
                  required: "First name is required",
                  minLength: {
                    value: 2,
                    message: "First name must be at least 2 characters long.",
                  },
                  maxLength: {
                    value: 32,
                    message: "First name cannot exceed 32 characters.",
                  },
                })}
                placeholder="First Name"
              />
              {errors.firstName && <p>{errors.firstName.message}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name:</label>
              <input
                id="lastName"
                {...register("lastName", {
                  required: "Last name is required",
                  minLength: {
                    value: 2,
                    message: "Last name must be at least 2 characters long.",
                  },
                  maxLength: {
                    value: 32,
                    message: "Last name cannot exceed 32 characters.",
                  },
                })}
                placeholder="Last Name"
              />
              {errors.lastName && <p>{errors.lastName.message}</p>}
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              type="email"
              {...register("email", {
                required: "Email is required",
                validate: validateEmail,
              })}
              placeholder="Email"
            />
            {errors.email && <p>{errors.email.message}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone Number:</label>
            <input
              id="phone"
              type="tel"
              {...register("phone", {
                pattern: {
                  value: /^[0-9]{6,12}$/,
                  message: "Please enter a valid phone number (6-12 digits)",
                },
              })}
              placeholder="Phone Number"
            />
            {errors.phone && <p>{errors.phone.message}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="message">Message:</label>
            <textarea
              id="message"
              {...register("message", {
                required: "Message is required",
                maxLength: {
                  value: 500,
                  message: "Message cannot exceed 500 characters.",
                },
              })}
              placeholder="Your message..."
            />
            {errors.message && <p>{errors.message.message}</p>}
          </div>
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
};

export default React.memo(ContactForm);
