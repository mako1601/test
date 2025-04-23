import * as React from 'react';
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Button, FormControl, FormLabel, TextField, Typography } from "@mui/material";

import PageCard from "./PageCard";
import { useAuth } from "@context/AuthContext";
import { profileSchema } from '@schemas/userSchemas';
import { updateUser } from '@api/userApi';
import { refreshToken } from '@api/axiosInstance';
import { UpdUserData } from "@mytypes/userTypes";
import { SnackbarContext } from '@context/SnackbarContext';

const ProfileForm = () => {
  const { setSeverity, setMessage, setOpen } = React.useContext(SnackbarContext);
  const { user, setUser } = useAuth();
  const [loadingProfile, setLoadingProfile] = React.useState(false);
  
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<UpdUserData>({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      lastName: user?.lastName || "",
      firstName: user?.firstName || "",
      middleName: user?.middleName || "",
    },
  });

  const onSubmitProfile = async (data: UpdUserData) => {
    try {
      setLoadingProfile(true);
      await updateUser(data);
      await refreshToken();
      setUser({ ...user!, ...data });
      resetProfile(data);
      setSeverity("success");
      setMessage("Данные успешно изменены!");
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
      setLoadingProfile(false);
    }
  };

  return (
    <PageCard>
      <FormControl>
        <Typography variant="h5">Информация</Typography>
      </FormControl>
      <Box
        component="form"
        onSubmit={handleSubmitProfile(onSubmitProfile)}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        <FormControl>
          <FormLabel>
            Фамилия
          </FormLabel>
          <TextField
            {...registerProfile("lastName")}
            fullWidth
            placeholder="Иванов"
            autoComplete="family-name"
            error={!!profileErrors.lastName}
            helperText={profileErrors.lastName?.message}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Имя</FormLabel>
          <TextField
            {...registerProfile("firstName")}
            fullWidth
            placeholder="Иван"
            autoComplete="given-name"
            error={!!profileErrors.firstName}
            helperText={profileErrors.firstName?.message}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Отчество</FormLabel>
          <TextField
            {...registerProfile("middleName")}
            fullWidth
            placeholder="Иванович (необязательно)"
            autoComplete="additional-name"
            error={!!profileErrors.middleName}
            helperText={profileErrors.middleName?.message}
          />
        </FormControl>
        <Button
          type="submit"
          sx={{ maxWidth: '16rem' }}
          variant={loadingProfile ? "outlined" : "contained"}
          disabled={loadingProfile}
        >
          {loadingProfile ? "Сохранение изменений…" : "Сохранить изменения"}
        </Button>
      </Box>
    </PageCard>
  );
}

export default ProfileForm;