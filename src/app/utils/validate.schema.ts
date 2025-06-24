import * as Yup from 'yup';

export const LoginSchema = Yup.object().shape({
   
    Password: Yup.string()
        .min(2, 'Too Short!')
        .max(50, 'Too Long!')
        .required('Không được để trống'),
    Email: Yup.string()
        .email('Invalid email')
        .required('Không được để trống'),
  });
export const RequestPasswordSchema = Yup.object().shape({
   
    email: Yup.string()
        .email('Invalid email')
        .required('Không được để trống'),
  });
  export const ChangePassSchema = Yup.object().shape({
    currentPassword: Yup.string().required("Bắt buộc"),
    newPassword: Yup.string().min(6, "Tối thiểu 6 ký tự").required("Bắt buộc"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("newPassword")], "Mật khẩu không khớp")
      .required("Bắt buộc"),
  });
  export const ForgotPasswordSchema = Yup.object().shape({
    code: Yup.string().required("Bắt buộc"),
    newPassword: Yup.string().min(6, "Tối thiểu 6 ký tự").required("Bắt buộc"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("newPassword")], "Mật khẩu không khớp")
      .required("Bắt buộc"),
  });

export const RegisterSchema = Yup.object().shape({
  email: Yup.string()
    .email("Email không hợp lệ")
    .required("Không được để trống"),

 firstName: Yup.string()
    .min(2, "Tên quá ngắn")
    .max(50, "Tên quá dài")
    .required("Không được để trống"),
  lastName: Yup.string()
    .min(1, "Họ quá ngắn")
    .max(50, "Họ quá dài")
    .required("Không được để trống"),

  password: Yup.string()
    .min(2, "Mật khẩu quá ngắn")
    .max(50, "Mật khẩu quá dài")
    .required("Không được để trống"),

  gender: Yup.boolean()
    .required("Không được để trống"),
});

  export const UpdateUserSchema = Yup.object().shape({
    firstName: Yup.string().required('Họ và tên Không được để trống'),
    lastName: Yup.string().required('Họ và tên Không được để trống'),
    phone: Yup.string().required('Số điện thoại Không được để trống'),
    gender: Yup.string().required('Số điện thoại Không được để trống'),

  })