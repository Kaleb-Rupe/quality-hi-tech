import React from "react";
import { useForm } from "react-hook-form";
import emailjs from "@emailjs/browser";

export default function App() {
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
    // const userID = "hohx4dG5zc1Gehn9H"; // replace with your user ID (If you want customer profiles.)

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
      .send(
        serviceID,
        templateID,
        //Use this for the template integration on www.emailjs.com using object => {{}}.
        {
          name: data.name,
          email: data.email,
          phone: data.phone,
          message: data.message,
        }
        // userID (Remove note if you are integrating customer profiles.)
      )
      .then((response) => {
        console.log("Email sent successfully!", response.status, response.text);
      })
      .catch((error) => {
        console.error("Failed to send email:", error);
      });

    // console.log("Sending email with the data."); Used for testing.
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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
      {errors.name && <p role="alert">{errors.name.message}</p>}

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
      {errors.email && <p role="alert">{errors.email.message}</p>}

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
      {errors.phone && <p role="alert">{errors.phone.message}</p>}

      <label htmlFor="message">Message:</label>
      <textarea
        id="message"
        name="message"
        {...register("message", {
          maxLength: {
            value: 120,
            message: "Message cannot exceed 120 characters.",
          },
        })}
      />
      {errors.message && <p role="alert">{errors.message.message}</p>}

      <input type="submit" />
    </form>
  );
}
