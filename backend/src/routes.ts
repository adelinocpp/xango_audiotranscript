import express from "express";
import multer from "multer";
// import { Request, Response } from "express";
import UserController from "./Controllers/UserController";
import CaptchaController from "./Controllers/CaptchaController";
// import ProfileController from "./Controllers/ProfileController";
// import AdminController from "./Controllers/AdminController";
import BackEndController from "./Controllers/BackEndController";
// import ExtraEmailController from "./Controllers/ExtraEmailController";
// import MailingAddressController from "./Controllers/UserProfile/MailingAddressController";
// import PhoneNumberController from "./Controllers/UserProfile/PhoneNumberController";
// import InviteController from "./Controllers/InviteController";
// import PaymentController from "./Controllers/PaymentController";
// import DBController from "./Controllers/DBController";
// import ForensicCaseController from "./Controllers/ForensicCaseController";
// import AlertController from "./Controllers/AlertController";

import multerConfig from "./Config/multer";
// import FileController from "./Controllers/FileController";
//var geoip = require('geoip-lite');

const routes  = express.Router();
// ==== FUNCOES DE TESTE DO FRONEND ===========================================
// --- STORE LOG EVENTS PRONTO
// --- Rota de verificacao do servidor ----------------------------------------
routes.get("/status", BackEndController.statusBackEnd);
routes.get("/front_end_prefix", BackEndController.prefixFrontEnd);
routes.post("/check_token", BackEndController.checkAcessToken);
// ============================================================================

// --- Controle de captcha ----------------------------------------------------
routes.get("/captcha/get_new/:id_client", CaptchaController.GetNewCaptcha);


// --- Rotas para informaçoes do banco de dados -------------------------------
// routes.get("/tables/:tokennum",DBController.getTables);
// routes.get("/list_table",DBController.listTable);
// routes.get("/list_table_by_user",DBController.listTableByUser);
// routes.get("/search_on_table",DBController.searchOnTable);
// routes.get("/search_on_table_by_user",DBController.searchOnTableByUser);
// routes.get("/insert_on_table",DBController.getTable);
// routes.get("/insert_on_table_by_user",DBController.getTable);
// routes.get("/update_on_table",DBController.getTable);
// routes.get("/update_on_table_by_user",DBController.getTable);
// routes.get("/delete_on_table",DBController.getTable);
// routes.get("/delete_on_table_by_user",DBController.getTable);

// routes.post("/aware_alerts",AlertController.SetAwareById);
// routes.get("/get_users",DBController.getDecriptTable);
// routes.get("/check_userName/:username", DBController.checkUser);
// routes.get("/admim_table/", DBController.getAdmimTable);
// ============================================================================


// --- Rotas auxiliares pra usuario ----------------------------------------




// --- Rotas de tratamento de dados de usuario --------------------------------
routes.get("/logout", function(req, res) {
    res.status(200).json({Autenticate: 0, token: null});
    });
routes.post("/login", UserController.login);
// routes.get("/access/:tokennum", UserController.accessWithToken);
// routes.post("/signup", UserController.SignUp);
// routes.get("/signup", UserController.SignUp);
// routes.post("/recovery_password", UserController.recoveryPassWord);
// //routes.post("/check_update_password", UserController.checkUpdatePassWord);
// routes.post("/update_password", UserController.updatePassWord);
// routes.post("/update_password_by_token", UserController.updatePassWordByAcessToken);

// -- Rota que verifica usuário por e-mail -----------------------
// routes.get("/request_verify_user/:tokennum", UserController.requestVerifyUserEmail);
// routes.get("/verify_user/:tokennum", UserController.verifyUserById);
// routes.post("/close_account/:tokennum", UserController.CloseAccount);


// ============================================================================
// --- Rotas de tratamento de perfil do usuário -------------------------------
// routes.get("/profile", ProfileController.GetProfileById);
// routes.post("/profile", ProfileController.SetProfileById);
// routes.delete("/profile", ProfileController.RemoveProfileById);

// ============================================================================
// routes.post("/alert", AlertController.SetAwareById);

// ============================================================================
// --- Rotas para envio de dados ----------------------------------------------
// routes.post("/send_requisition_from_app", ForensicCaseController.getForensicCaseFromApp);
// routes.post("/check_case_label", ForensicCaseController.checkForensicCaseByTag);
// routes.post("/send_requisition_from_site", ForensicCaseController.getForensicCaseFromFrontEnd);

//routes.post("/profile_avatar", multer({ dest: '../../tmp/' }).single("file"), ProfileController.SetAvatar);

// --- Rotas de administração dos emails extras -------------------------------
// routes.get("/extra_email", ExtraEmailController.ListExtraEmailById);
// routes.post("/extra_email", ExtraEmailController.addExtraEmailById);
// routes.put("/extra_email", ExtraEmailController.UpdateExtraEmailById);
// routes.post("/remove_extra_email", ExtraEmailController.RemoveExtraEmailById);
// routes.post("/make_main_extra_email", UserController.ChangeMainEmail);
// routes.get("/verify_extraemail/:passphrase", ExtraEmailController.verifyExtraEmailById);
// routes.post("/request_verify_email/", ExtraEmailController.requestVerifyExtraEmail);

// --- Sera que necessita GET ?
// routes.get("/mailing_address", MailingAddressController.ListExtraEmailByUserId);
// routes.post("/mailing_address", MailingAddressController.AddMailingAddress);
// routes.delete("/mailing_address", MailingAddressController.RemoveMailingAddressById);
// routes.put("/mailing_address", MailingAddressController.UpdateMailingAddressById);

// --- Sera que necessita GET ?
// routes.get("/phone_number", PhoneNumberController.ListPhoneNumberByUserId);
// routes.post("/phone_number", PhoneNumberController.AddPhoneNumber);
// routes.delete("/phone_number", PhoneNumberController.RemovePhoneNumberById);
// routes.put("/phone_number", PhoneNumberController.UpdatePhoneNumberById);

// routes.post("/profile_avatar", multer(multerConfig).single("file"), ProfileController.SetAvatar);
// routes.delete("/profile_avatar", ProfileController.RemoveAvatar);
//routes.put("/profile_avatar", multer(multerConfig).single("file"), ProfileController.SetAvatar);
// routes.get("/files/:filename", FileController.getFile);



// ============================================================================
module.exports = routes;
// ----------------------------------------------------------------------------
// ============================================================================