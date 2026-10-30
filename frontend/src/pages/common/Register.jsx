import React from "react";
import { Button, Form } from "semantic-ui-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { registerApi } from "../../api/user";
import { useNavigate, Link } from "react-router-dom";

export function Register() {
  const navigate = useNavigate();
  const formik = useFormik({
    initialValues: initialValues(),
    validationSchema: validationSchema(),
    onSubmit: async (formValues) => {
      try {
        const response = await registerApi(formValues);
        const username = response?.user?.username || response?.username || "";
        toast.success(`¡Usuario ${username} registrado exitosamente! Inicia sesión.`);
        navigate("/login");
      } catch (error) {
        toast.error(error.message);
      }
    },
  });

  return (
    <div className="register-admin">
      <div className="register-admin__content">
        <h1>Registro</h1>
        <Form className="register-form-admin" onSubmit={formik.handleSubmit}>
          <label style={{ fontWeight: 600, display: "block", marginBottom: 5 }}>
            Username
          </label>
          <Form.Input
            name="username"
            placeholder="Username"
            value={formik.values.username}
            onChange={(e) => {
              const value = e.target.value.replace(/\s+/g, "");
              formik.setFieldValue("username", value);
            }}
            onBlur={formik.handleBlur}
            error={formik.touched.username && formik.errors.username ? formik.errors.username : null}
          />

          <label style={{ fontWeight: 600, display: "block", marginBottom: 5 }}>
            Correo electrónico
          </label>
          <Form.Input
            name="email"
            placeholder="Correo electrónico"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && formik.errors.email ? formik.errors.email : null}
          />

          <label style={{ fontWeight: 600, display: "block", marginBottom: 5 }}>
            Contraseña
          </label>
          <Form.Input
            name="password"
            type="password"
            placeholder="Contraseña (mínimo 8 caracteres)"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && formik.errors.password ? formik.errors.password : null}
            autoComplete="new-password"
          />

          <label style={{ fontWeight: 600, display: "block", marginBottom: 5 }}>
            Confirmar Contraseña
          </label>
          <Form.Input
            name="password_confirm"
            type="password"
            placeholder="Confirmar Contraseña"
            value={formik.values.password_confirm}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.password_confirm && formik.errors.password_confirm
                ? formik.errors.password_confirm
                : null
            }
            autoComplete="new-password"
          />

          <Button type="submit" content="Registrarse" primary fluid />
        </Form>
        <div className="auth-switch">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
        </div>
      </div>
    </div>
  );
}

function initialValues() {
  return {
    username: "",
    email: "",
    password: "",
    password_confirm: "",
  };
}

function validationSchema() {
  return Yup.object({
    username: Yup.string()
      .required("El username es obligatorio")
      .matches(/^\S*$/, "El username no debe contener espacios"),
    email: Yup.string()
      .email("Correo electrónico no válido")
      .required("El correo electrónico es obligatorio"),
    password: Yup.string()
      .required("La contraseña es obligatoria")
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .matches(
        /[A-Z]/,
        "La contraseña debe contener al menos una letra mayúscula"
      )
      .matches(/\d/, "La contraseña debe contener al menos un número")
      .matches(
        /[@$!%*?&#]/,
        "La contraseña debe contener al menos un carácter especial (@$!%*?&#)"
      ),
    password_confirm: Yup.string()
      .required("La confirmación de contraseña es obligatoria")
      .oneOf([Yup.ref("password"), null], "Las contraseñas no coinciden"),
  });
}
