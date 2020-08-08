/**
 * auth.js
 * Author: Roman Shuvalov
 */
'use strict';

const router = require('express').Router();
const { check } = require('express-validator');
const AuthController = require('../controllers/AuthController')

// Sign up a new user
router.post('/register', [
  check('firstName')
    .notEmpty().withMessage('first_name_not_empty')
    .isString().withMessage('first_name_is_string')
    .isLength({ min: 2 }).withMessage('first_name_is_min'),
  check('lastName')
    .notEmpty().withMessage('last_name_not_empty')
    .isString().withMessage('last_name_is_string')
    .isLength({ min: 2 }).withMessage('last_name_is_min'),
  check('email')
    .isEmail().withMessage('email_is_invalid')
    .notEmpty().withMessage('email_not_empty'),
  check('password').isLength({ min: 8 }).withMessage('password_is_min')
], AuthController.register);

// Log in an existing user
router.post('/login', [
  check('email')
    .isEmail().withMessage('email_is_invalid')
    .notEmpty().withMessage('email_not_empty'),
  check('password').isLength({ min: 8 }).withMessage('password_is_min')
], AuthController.login);

// forgot an existing user
router.post('/forgot', [
  check('email')
    .isEmail().withMessage('Неверный Email')
    .notEmpty().withMessage('Email не может быть пустым'),  
], AuthController.forgot);
router.post('/reset', [
  check('password')
  .notEmpty().withMessage('Пароль не может быть пустым')
  .isLength({ min: 8 }).withMessage('Пароль должен содержать минимум 8 символов'), 
  check('passwordConfirm')
  .custom((value, { req }) => value === req.body.password).withMessage('Подтверждение должно совпадать с паролем'),  
], AuthController.reset);
router.get('/login_vk', AuthController.loginVk);
router.get('/auth_vk', AuthController.authVk);
router.get('/login_fb', AuthController.loginFb);
router.get('/auth_fb', AuthController.authFb);

module.exports = router;