import * as React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Button, FormControl, FormLabel, IconButton, InputAdornment, TextField, Typography } from "@mui/material";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import PageCard from "./PageCard";
import { passwordSchema } from '@schemas/userSchemas';
import { updatePassword } from '@api/userApi';
import { UpdUserPass } from '@mytypes/userTypes';
import { SnackbarContext } from '@context/SnackbarContext';

interface UpdatePasswordData {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

const ChangePasswordForm = () => {
  const { setSeverity, setMessage, setOpen } = React.useContext(SnackbarContext);
  const [loadingPassword, setLoadingPassword] = React.useState(false);
  const [showOldPassword, setShowOldPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = React.useState(false);

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<UpdatePasswordData>({
    resolver: yupResolver(passwordSchema),
  });

  const onSubmitPassword = async (data: UpdatePasswordData) => {
    try {
      setLoadingPassword(true);
      const updUserPass: UpdUserPass = { oldPassword: data.oldPassword, newPassword: data.newPassword };
      await updatePassword(updUserPass);
      resetPassword();
      setSeverity("success");
      setMessage("Пароль успешно изменен!");
    } catch (e: any) {
      console.error(e);
      setSeverity("error");
      if (e.response) {
        setMessage(e.response.data);
      } else if (e.request) {
        setMessage("Сервер не отвечает, повторите попытку позже");
      } else {
        setMessage("Произошла неизвестная ошибка");
      }
    } finally {
      setOpen(true);
      setLoadingPassword(false);
    }
  };

  const handleToggleOldPasswordVisibility = () => {
    setShowOldPassword(!showOldPassword);
  };

  const handleToggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const handleToggleConfirmNewPasswordVisibility = () => {
    setShowConfirmNewPassword(!showConfirmNewPassword);
  };

  return (
    <PageCard>
      <FormControl>
        <Typography variant="h5">Смена пароля</Typography>
      </FormControl>
      <Box
        component="form"
        onSubmit={handleSubmitPassword(onSubmitPassword)}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        <FormControl>
          <FormLabel>Текущий пароль</FormLabel>
          <TextField
            {...registerPassword("oldPassword")}
            fullWidth
            placeholder="••••••"
            autoComplete="new-password"
            type={showOldPassword ? "text" : "password"}
            error={!!passwordErrors.oldPassword}
            helperText={passwordErrors.oldPassword?.message}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleToggleOldPasswordVisibility}
                    edge="end"
                    title={showOldPassword ? "Спрятать пароль" : "Отобразить пароль"}
                    style={{ border: 0, backgroundColor: 'transparent' }}
                  >
                    {showOldPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Новый пароль</FormLabel>
          <TextField
            {...registerPassword("newPassword")}
            fullWidth
            placeholder="••••••"
            autoComplete="new-password"
            type={showNewPassword ? "text" : "password"}
            error={!!passwordErrors.newPassword}
            helperText={passwordErrors.newPassword?.message}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleToggleNewPasswordVisibility}
                    edge="end"
                    title={showNewPassword ? "Спрятать пароль" : "Отобразить пароль"}
                    style={{ border: 0, backgroundColor: 'transparent' }}
                  >
                    {showNewPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Подтверждение нового пароля</FormLabel>
          <TextField
            {...registerPassword("confirmNewPassword")}
            fullWidth
            placeholder="••••••"
            autoComplete="new-password"
            type={showConfirmNewPassword ? "text" : "password"}
            error={!!passwordErrors.confirmNewPassword}
            helperText={passwordErrors.confirmNewPassword?.message}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleToggleConfirmNewPasswordVisibility}
                    edge="end"
                    title={showConfirmNewPassword ? "Спрятать пароль" : "Отобразить пароль"}
                    style={{ border: 0, backgroundColor: 'transparent' }}
                  >
                    {showConfirmNewPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </FormControl>
        <Button
          type="submit"
          sx={{ maxWidth: '16rem' }}
          variant={loadingPassword ? "outlined" : "contained"}
          disabled={loadingPassword}
        >
          {loadingPassword ? "Сохранение изменений…" : "Изменить пароль"}
        </Button>
      </Box>
    </PageCard>
  );
}

export default ChangePasswordForm;