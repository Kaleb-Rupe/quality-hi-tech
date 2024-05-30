import React, { useState } from "react";
import { useForm } from "react-hook-form";

import emailjs from "@emailjs/browser";
import "../components/Contact.css";

export const ContactForm = () => {
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
    // Handle form submission
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
        firstName: data.firstName,
        lastName: data.lastName,
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
    <>
      {submissionStatus === "success" ? (
        <div className="success-message-contact">
          <h2>Thank you!</h2>
          <p>Your message has been sent successfully.</p>
        </div>
      ) : (
        <div className="contact-container">
          <h2>Leave Us A Message</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="contact-form">
            <div className="form-group-container">
              <div className="form-group">
                <label htmlFor="firstName">First Name:</label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="First Name"
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
                />
                {errors.firstName && <p>{errors.firstName.message}</p>}
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name:</label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Last Name"
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
                />
                {errors.lastName && <p>{errors.lastName.message}</p>}
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Email"
                {...register("email", {
                  required: "Email is required",
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
              {errors.email && <p>{errors.email.message}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number:</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Phone Number"
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
              {errors.message && <p>{errors.message.message}</p>}
            </div>
            <button type="submit">Send</button>
          </form>
        </div>
      )}
    </>
  );
};
